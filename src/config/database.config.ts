export const maxPoolSize: number = 5; // Maximum number of connections in the pool
export const minPoolSize: number = 1; // Minimum number of connections to keep open
export const connectTimeoutMS: number = 10000; // Timeout for initial connection (10 seconds)
export const socketTimeoutMS: number = 45000; // Timeout for socket inactivity (45 seconds)

export const dbName = process.env.DB_NAME ?? "seo_traffic";
export const dbUser = process.env.DB_US ?? "postgres";
export const dbPassword = process.env.DB_PW ?? "password";
export const dbHost = process.env.DB_HOST ?? "localhost";
export const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);
export const MAX_BACKUPS = 3;
