import dotenv from "dotenv";

dotenv.config();

process.env.ENV_TYPE = "test";

import db from "../db/models/index";

// Verify if the database used is the test database
if (process.env.ENV_TYPE !== "test") {
  throw new Error("ENV_TYPE is not set to test");
}
if (db.sequelize.config.database !== process.env.MYSQL_TEST_DATABASE) {
  console.log(db.sequelize.config.database);
  throw new Error("Database is not the test database");
}
