import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "../configs/app/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Miratonrose API Documentation",
      version: "2.0.0",
      description: "This is the API documentation for the Miratonrose API.",
    },
    servers: [
      {
        url: `${config.domain}/v1`,
        description: `${config.domain.includes("localhost") ? "Development" : "Production"} server`,
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["src/docs/*.docs.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
