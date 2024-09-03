import dotenv from "dotenv";

dotenv.config();

const configs = require(__dirname + "/../config/config.js");
import { Sequelize, DataTypes } from "sequelize";

const env = process.env.ENV_TYPE || "development";
const config = configs[env];
const db: any = {};

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Import all the models
// ...

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
