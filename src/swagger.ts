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
        url: `http://localhost:${process.env.PORT || 3000}/api/admin`,
        description: "Admin Development Server",
      },
      {
        url: `https://traffic-seo-be.mauwebsite.top/api/admin`,
        description: "Admin Deployment Server",
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
  apis: ["./src/routes/admin.route/*.ts", "./src/routes/common.route/*.ts"], // Ensure this path matches your admin route files
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
        url: `http://localhost:${process.env.PORT || 3000}/api/client`,
        description: "Client Development Server",
      },
      {
        url: `https://traffic-seo-be.mauwebsite.top/api/client`,
        description: "Client Deployment Server",
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
  apis: ["./src/routes/client.route/*.ts", "./src/routes/common.route/*.ts"], // Ensure this path matches your client route files
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