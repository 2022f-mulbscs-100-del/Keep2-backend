import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Swagger configuration
export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Keeper API Documentation",
      version: "1.0.0",
      description: "API documentation for  Keeper app",
    },
    servers: [
      {
        url: `http://localhost:${process.env.SERVER_PORT}/api/`, // Your server URL
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [], // All routes will require Bearer token unless overridden
    },
  ],

  apis: [`${__dirname}/../Routes/*.js`], // Path to your route files for annotations
};

// Generate swagger spec
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerUi };
