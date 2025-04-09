import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
dotenv.config();
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Traffic SEO CYNO",
      version: "1.0.0",
      description: "Backend API for Traffic SEO System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Optional, can be "JWT" or any other token format
      },
    },
  },
  security: [
    {
      bearerAuth: [], // Apply Bearer token globally
    },
  ],
  apis: ["./src/routes/*.ts"], // Path to your route files with Swagger comments
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export { swaggerSpec };
