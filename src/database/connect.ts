import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "railway",
  "postgres",
  "AWOZHEIjajuMsmOQmbcmCLvEyYiOCfJM",
  {
    host: "shortline.proxy.rlwy.net",
    dialect: "postgres",
    port: 15059,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log("Database synchronized");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1); // Exit process with failure
  }
};

export { connectDB, sequelize };
