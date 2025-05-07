import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Traffic SEO CYNO - API",
      version: "1.0.0",
      description: "Backend API for Traffic SEO System - Endpoints",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/`,
        description: "Swagger Development Server",
      },
      {
        url: `https://traffic-seo-be.mauwebsite.top/api/`,
        description: "Swagger Deployment Server",
      },
      {
        url: `https://be.autoranker.net/api/`,
        description: "Swagger Deployment Server",
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
  apis: [
    "./src/routes/system.route/*.ts",
    "./src/routes/system.route/botRoute/*.ts",
    "./src/routes/system.route/commonRoute/*.ts",
    "./src/routes/system.route/coreRoute/*.ts",
    "./src/routes/system.route/moneyRoute/*.ts",
    "./src/routes/system.route/roleRoute/*.ts"
  ], // Ensure this path matches your admin route files
};

// const clientSwaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Traffic SEO CYNO - Client API",
//       version: "1.0.0",
//       description: "Backend API for Traffic SEO System - Client Endpoints",
//     },
//     servers: [
//       {
//         url: `http://localhost:${process.env.PORT || 3000}/api/client`,
//         description: "Client Development Server",
//       },
//       {
//         url: `https://traffic-seo-be.mauwebsite.top/api/client`,
//         description: "Client Deployment Server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//     security: [{ bearerAuth: [] }],
//   },
//   apis: ["./src/routes/client.route/*.ts", "./src/routes/common.route/*.ts"], // Ensure this path matches your client route files
// };
export const setupSwaggerDocs = (
  app: express.Application,
  path: string,
  spec: any
) => {
  app.use(path, swaggerUi.serveFiles(spec), swaggerUi.setup(spec));
};
export const swaggerSpec = swaggerJSDoc(SwaggerOptions);
// export const swaggerSpecClient = swaggerJSDoc(clientSwaggerOptions);