import dotenv from "dotenv";

dotenv.config();

const configs = require(__dirname + "/../config/config.js");
import { Sequelize } from "sequelize-typescript";

const env = process.env.ENV_TYPE || "development";
const config = configs[env];
const db: any = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Import all the models
import UserRoles from "./user_role";
import User from "./user";

sequelize.addModels([UserRoles, User]);

db.UserRoles = UserRoles;
db.User = User;

// Export the sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
