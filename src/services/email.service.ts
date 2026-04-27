import { Job } from "bullmq";
import { sendEmail } from "../configs/email/emailConfig";
import UserRepository from "../repository/user.repository";
import { SendEmailToAllUserDto } from "../types/admin";
import { BadRequestException } from "../utils/exceptions/customException";
import { logger } from "../utils/logger/logger";
import { TemplateData } from "../types/email";
import { BaseQueueService } from "./base-queue.service";
import { injectable } from "tsyringe";

@injectable()
export class EmailService {
  constructor(
    private baseQueueService: BaseQueueService,
    private userRepo: UserRepository,
  ) {}

  public emailWorker = this.baseQueueService.createWorker(
    "email_notification",
    async (job) => this.processEmailJob(job),
    {
      concurrency: 15,
      removeOnComplete: {
        count: 100,
      },
      removeOnFail: {
        count: 4000,
      },
    },
  );
  public emailQueue = this.baseQueueService.createQueue("email_notification");

  /**
   * Sends an email to the specified email address.
   * @param name The name of the template to use
   * @param email The email address to send to
   * @param data Optional data to pass to the template
   * @param delay Optional delay in milliseconds before sending the email
   * @returns The job object added to the email queue
   */
  public async sendEmail(
    name: string,
    email: string,
    data?: TemplateData,
    delay?: number,
  ) {
    const job = await this.emailQueue.add(
      name,
      { email, data },
      { attempts: 3, backoff: 5000, delay },
    );
    logger.info(`Email added to queue - id: ${job.id}`);
  }

  /**
   * Handles the sending of various types of emails based on the job's name.
   *
   * @param job - The job object containing the name of the email task.
   * @param email - The recipient's email address.
   * @param data - The template data used to populate the email content.
   *
   * This function determines the type of email to send by inspecting the job's name.
   * It supports multiple email types such as password reset, registration, feature updates,
   * welcome messages, and system updates. The email content is customized using the provided
   * template data and includes the current year.
   */
  private async emailHandler(job: Job, email: string, data: TemplateData) {
    // Get the year
    const dt = new Date();
    const year = dt.getFullYear();
    // Handle the job based on job name
    switch (job.name) {
      case "reset-otp":
        return await sendEmail(email, "Password Reset OTP", job.name, {
          title: "OTP",
          year,
          ...data,
        });
      case "registration":
        return await sendEmail(email, "Verify Email", job.name, {
          title: "Registration",
          year,
          ...data,
        });
      case "feature-update":
        return await sendEmail(email, "New Features Update", job.name, {
          title: "MiratonRose Feature Update",
          year,
          ...data,
        });
      case "welcome":
        return await sendEmail(
          email,
          "Welcome to Miraton Rose Africa",
          job.name,
          {
            title: "MiratonRose Welcome",
            year,
            ...data,
          },
        );
      case "system-update":
        return await sendEmail(
          email,
          "Welcome to Miraton Rose Africa",
          job.name,
          {
            title: "MiratonRose Welcome",
            year,
            ...data,
          },
        );
      case "token-purchase":
        return await sendEmail(
          email,
          "Your Electricity Token Is Ready",
          job.name,
          {
            title: "Token Purchase",
            year,
            ...data,
          },
        );
      case "bill-purchase":
        return await sendEmail(
          email,
          "Your Bill Payment Was Successful",
          job.name,
          {
            title: "Bill Purchase",
            year,
            ...data,
          },
        );
      case "invite":
        return await sendEmail(
          email,
          "You're invited to join Miraton Rose Africa – Complete your setup",
          job.name,
          {
            title: "Invitation Link",
            year,
            ...data,
          },
        );
      default:
        return await sendEmail(email, data.subject, "index", {
          title: "MiratonRose",
          year,
          content: data.content,
        });
    }
  }

  /**
   * Handles a job added to the email queue.
   * @param job - The job containing the email and data
   * @returns The message ID if the email was sent successfully, otherwise the error message
   */
  public async processEmailJob(job: Job) {
    logger.info(`Processing email request - id: ${job.id}`);
    const { email, data } = job.data;
    // Handle the email job
    const result = await this.emailHandler(job, email, data);

    logger.debug(
      `success: ${result.success}, message: ${result.messageId ?? result.error}`,
    );

    if (result) {
      return result.success ? result.messageId : result.error;
    }
  }

  /**
   * Sends an email to all users in the database.
   * @param template - The template name to use
   * @param data - The data to use in the email template
   * @throws {BadRequestException} If no users are present in the database
   */
  public async sendToAllUsers(template: string, data: SendEmailToAllUserDto) {
    const allUsers = await this.userRepo.getAllUsers();

    if (!allUsers.length) {
      throw new BadRequestException("No user in the database");
    }

    await Promise.all(
      allUsers.map((user) => {
        return this.sendEmail(template, user.email, {
          ...data,
          firstName: user.firstName,
        });
      }),
    );
  }
}
