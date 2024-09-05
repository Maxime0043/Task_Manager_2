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
import Client from "./client";
import ProjectStatus from "./project_status";
import Project from "./project";
import TaskStatus from "./task_status";
import Task from "./task";
import TaskUsers from "./task_users";
import TaskFiles from "./task_files";
import TaskScheduled from "./task_scheduled";
import Conversation from "./conversation";
import ConversationUsers from "./conversation_users";
import ConversationProjects from "./conversation_projects";

sequelize.addModels([
  UserRoles,
  User,
  Client,
  ProjectStatus,
  Project,
  TaskStatus,
  Task,
  TaskUsers,
  TaskFiles,
  TaskScheduled,
  Conversation,
  ConversationUsers,
  ConversationProjects,
]);

db.UserRoles = UserRoles;
db.User = User;
db.Client = Client;
db.ProjectStatus = ProjectStatus;
db.Project = Project;
db.TaskStatus = TaskStatus;
db.Task = Task;
db.TaskUsers = TaskUsers;
db.TaskFiles = TaskFiles;
db.TaskScheduled = TaskScheduled;
db.Conversation = Conversation;
db.ConversationUsers = ConversationUsers;
db.ConversationProjects = ConversationProjects;

// Export the sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
