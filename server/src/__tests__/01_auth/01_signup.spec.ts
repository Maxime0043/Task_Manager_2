import dotenv from "dotenv";

dotenv.config();

process.env.ENV_TYPE = "test";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/auth/signup";

describe(`POST ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();
  });

  afterAll(async () => {
    // Close the database connection
    await db.sequelize.close();
  });
});
