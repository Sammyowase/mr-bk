import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";
import { injectable } from "tsyringe";
import { logger } from "../utils/logger/logger";

/**
 * Configuration for retry operations
 */
interface RetryConfig {
  maxRetries: number;
  initialRetryTime: number;
  maxRetryTime: number;
  factor: number;
}

/**
 * Message with retry metadata
 */
interface RetryMessage<T> {
  topic: string;
  message: T;
  key?: string;
  retryCount: number;
}

@injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private retryConfig: RetryConfig;
  private messageQueue: RetryMessage<unknown>[] = [];
  private processingQueue: boolean = false;

  constructor() {
    this.retryConfig = {
      maxRetries: parseInt(process.env.KAFKA_MAX_RETRIES || "5"),
      initialRetryTime: parseInt(
        process.env.KAFKA_INITIAL_RETRY_TIME || "1000",
      ),
      maxRetryTime: parseInt(process.env.KAFKA_MAX_RETRY_TIME || "30000"),
      factor: parseInt(process.env.KAFKA_RETRY_FACTOR || "2"),
    };

    this.kafka = new Kafka({
      clientId: "mr-web-backend",
      brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
      ssl: process.env.KAFKA_SSL === "true",
      sasl:
        process.env.KAFKA_SASL_ENABLED === "true"
          ? {
              mechanism: "plain",
              username: process.env.KAFKA_SASL_USERNAME || "",
              password: process.env.KAFKA_SASL_PASSWORD || "",
            }
          : undefined,
      retry: {
        initialRetryTime: this.retryConfig.initialRetryTime,
        maxRetryTime: this.retryConfig.maxRetryTime,
        retries: this.retryConfig.maxRetries,
        factor: this.retryConfig.factor,
      },
    });

    this.producer = this.kafka.producer({
      retry: {
        initialRetryTime: this.retryConfig.initialRetryTime,
        maxRetryTime: this.retryConfig.maxRetryTime,
        retries: this.retryConfig.maxRetries,
        factor: this.retryConfig.factor,
      },
    });

    this.initProducer();
    this.enableShutdownHooks();
  }

  /**
   * Calculate backoff time using exponential backoff algorithm
   */
  private calculateBackoff(retryCount: number): number {
    const backoff = Math.min(
      this.retryConfig.maxRetryTime,
      this.retryConfig.initialRetryTime *
        Math.pow(this.retryConfig.factor, retryCount),
    );
    // Add some jitter to prevent all retries happening simultaneously
    return backoff + Math.floor(Math.random() * 1000);
  }

  /**
   * Initialize the Kafka producer with retry logic
   */
  private async initProducer(retryCount: number = 0): Promise<void> {
    try {
      await this.producer.connect();
      logger.info("Kafka producer connected");

      // Start processing any queued messages
      this.processMessageQueue();
    } catch (error) {
      logger.error(
        `Failed to connect Kafka producer (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
        error,
      );

      if (retryCount < this.retryConfig.maxRetries) {
        const backoff = this.calculateBackoff(retryCount);
        logger.info(`Retrying producer connection in ${backoff}ms`);
        setTimeout(() => this.initProducer(retryCount + 1), backoff);
      } else {
        logger.error(
          `Failed to connect Kafka producer after ${this.retryConfig.maxRetries} attempts`,
        );
      }
    }
  }

  /**
   * Process the message queue
   */
  private async processMessageQueue(): Promise<void> {
    if (this.processingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.messageQueue.length > 0) {
        const { topic, message, key, retryCount } = this.messageQueue.shift()!;

        try {
          await this.sendMessage(topic, message, key);
        } catch (error) {
          if (retryCount < this.retryConfig.maxRetries) {
            const backoff = this.calculateBackoff(retryCount);
            logger.info(
              `Requeueing message to topic ${topic} for retry in ${backoff}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
            );

            setTimeout(() => {
              this.messageQueue.push({
                topic,
                message,
                key,
                retryCount: retryCount + 1,
              });
              this.processMessageQueue();
            }, backoff);
          } else {
            logger.error(
              `Failed to publish message to topic ${topic} after ${this.retryConfig.maxRetries} attempts`,
              error,
            );
            // Consider sending to a dead letter queue here
            this.sendToDeadLetterQueue(topic, message, key, error);
          }
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Send a message to the dead letter queue
   */
  private async sendToDeadLetterQueue(
    topic: string,
    message: unknown,
    key?: string,
    error?: Error | unknown,
  ): Promise<void> {
    const deadLetterTopic = `${topic}.dead-letter`;

    try {
      await this.sendMessage(
        deadLetterTopic,
        {
          originalMessage: message,
          error: error ? error.toString() : "Unknown error",
          timestamp: new Date().toISOString(),
        },
        key,
      );

      logger.info(`Message sent to dead letter queue ${deadLetterTopic}`);
    } catch (dlqError) {
      logger.error(
        `Failed to send message to dead letter queue ${deadLetterTopic}`,
        dlqError,
      );
    }
  }

  /**
   * Send a message to Kafka without retry logic (used internally)
   */
  private async sendMessage<T>(
    topic: string,
    message: T,
    key?: string,
  ): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: key || undefined,
          value: JSON.stringify(message),
          headers: {
            "content-type": "application/json",
            timestamp: Date.now().toString(),
          },
        },
      ],
    });
    logger.info(`Message published to topic ${topic}`);
  }

  /**
   * Publish a message to Kafka with retry logic
   */
  public async publish<T>(
    topic: string,
    message: T,
    key?: string,
  ): Promise<void> {
    try {
      await this.sendMessage(topic, message, key);
    } catch (error) {
      logger.error(
        `Failed to publish message to topic ${topic}, adding to retry queue`,
        error,
      );

      // Add to retry queue
      this.messageQueue.push({ topic, message, key, retryCount: 0 });
      this.processMessageQueue();

      // We don't throw here to allow the application to continue
    }
  }

  /**
   * Subscribe to a Kafka topic with retry logic for consumer connection
   */
  public async subscribe(
    topic: string,
    groupId: string,
    handler: (payload: EachMessagePayload) => Promise<void>,
    maxRetries: number = 3,
  ): Promise<void> {
    await this.subscribeWithRetry(topic, groupId, handler, 0, maxRetries);
  }

  /**
   * Internal method to handle subscription with retry logic
   */
  private async subscribeWithRetry(
    topic: string,
    groupId: string,
    handler: (payload: EachMessagePayload) => Promise<void>,
    retryCount: number,
    maxRetries: number,
  ): Promise<void> {
    const consumerId = `${topic}-${groupId}`;

    if (this.consumers.has(consumerId)) {
      logger.warn(
        `Consumer for topic ${topic} with group ${groupId} already exists`,
      );
      return;
    }

    const consumer = this.kafka.consumer({
      groupId,
      retry: {
        initialRetryTime: this.retryConfig.initialRetryTime,
        maxRetryTime: this.retryConfig.maxRetryTime,
        retries: this.retryConfig.maxRetries,
        factor: this.retryConfig.factor,
      },
    });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      await consumer.run({
        eachMessage: async (payload) => {
          await this.processMessageWithRetry(topic, payload, handler);
        },
      });

      this.consumers.set(consumerId, consumer);
      logger.info(`Consumer for topic ${topic} with group ${groupId} started`);
    } catch (error) {
      logger.error(
        `Failed to start consumer for topic ${topic} (attempt ${retryCount + 1}/${maxRetries})`,
        error,
      );

      if (retryCount < maxRetries) {
        const backoff = this.calculateBackoff(retryCount);
        logger.info(`Retrying consumer connection in ${backoff}ms`);

        setTimeout(() => {
          this.subscribeWithRetry(
            topic,
            groupId,
            handler,
            retryCount + 1,
            maxRetries,
          );
        }, backoff);
      } else {
        logger.error(
          `Failed to start consumer for topic ${topic} after ${maxRetries} attempts`,
        );
        throw error;
      }
    }
  }

  /**
   * Process a message with retry logic
   */
  private async processMessageWithRetry(
    topic: string,
    payload: EachMessagePayload,
    handler: (payload: EachMessagePayload) => Promise<void>,
    retryCount: number = 0,
  ): Promise<void> {
    try {
      await handler(payload);
    } catch (error) {
      logger.error(
        `Error processing message from topic ${topic} (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
        error,
      );

      if (retryCount < this.retryConfig.maxRetries) {
        const backoff = this.calculateBackoff(retryCount);
        logger.info(`Retrying message processing in ${backoff}ms`);

        setTimeout(() => {
          this.processMessageWithRetry(topic, payload, handler, retryCount + 1);
        }, backoff);
      } else {
        logger.error(
          `Failed to process message from topic ${topic} after ${this.retryConfig.maxRetries} attempts`,
        );

        // Send to dead letter queue
        try {
          const message = payload.message.value?.toString();
          const parsedMessage = message ? JSON.parse(message) : {};

          await this.sendToDeadLetterQueue(
            topic,
            parsedMessage,
            payload.message.key?.toString(),
            error,
          );
        } catch (dlqError) {
          logger.error(
            `Failed to send failed message to dead letter queue`,
            dlqError,
          );
        }
      }
    }
  }

  /**
   * Disconnect from Kafka
   */
  public async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();

      for (const [id, consumer] of this.consumers.entries()) {
        await consumer.disconnect();
        this.consumers.delete(id);
      }

      logger.info("Kafka connections closed gracefully");
    } catch (error) {
      logger.error("Error disconnecting from Kafka", error);
    }
  }

  /**
   * Register shutdown hooks to gracefully disconnect from Kafka
   */
  private enableShutdownHooks(): void {
    const shutdown = async () => {
      await this.disconnect();
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
}
