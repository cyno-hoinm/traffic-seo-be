import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const adminSwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Traffic SEO CYNO - Admin API",
      version: "1.0.0",
      description: "Backend API for Traffic SEO System - Admin Endpoints",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Admin Development Server",
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/admin.route/*.ts"], // Ensure this path matches your admin route files
};

const clientSwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Traffic SEO CYNO - Client API",
      version: "1.0.0",
      description: "Backend API for Traffic SEO System - Client Endpoints",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Client Development Server",
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/client.route/*.ts"], // Ensure this path matches your client route files
};
export const setupSwaggerDocs = (
  app: express.Application,
  path: string,
  spec: any
) => {
  app.use(path, swaggerUi.serveFiles(spec), swaggerUi.setup(spec));
};
export const swaggerSpecAdmin = swaggerJSDoc(adminSwaggerOptions);
export const swaggerSpecClient = swaggerJSDoc(clientSwaggerOptions);
