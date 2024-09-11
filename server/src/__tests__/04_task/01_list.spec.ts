import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateProjects, populateTasks } from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

const url = "/api/v1/tasks";

var cookie: string;

describe(`GET ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Create a user
    const user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });

    // Create a client
    const client = await Client.create({
      name: `Client 1`,
      email: `client1@example.com`,
      description: `Description of the client 1`,
      creatorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a project
    const project = await Project.create({
      name: "Project 1",
      statusId: 1,
      budget: Math.floor(Math.random() * 100000),
      description: "Description of the project 1",
      isInternalProject: true,
      managerId: user.id,
      clientId: client.id,
      creatorId: user.id,
    });

    // Populate database with tasks
    await populateTasks(user.id, project.id);

    // Sign in the user
    const res = await supertest(app).post("/api/v1/auth/signin").send({
      email: "john.doe@example.com",
      password: "password",
    });

    // Save the cookie to use it later to authenticate
    cookie = res.header["set-cookie"];
  });

  afterAll(async () => {
    // Close the database connection
    await db.sequelize.close();
  });

  it("should return 401 if the user is not authenticated", async () => {
    const res = await supertest(app).get(url);

    expect(res.status).toBe(401);
  });

  it.each([
    {},
    { limit: "a" },
    { limit: "" },
    { limit: null },
    { limit: undefined },
  ])(
    "should return 400 if the limit is not set or not a number - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query(query);

      expect(res.status).toBe(400);
      expect(res.body.errors[0].param).toBe("limit");
    }
  );

  it.each([
    {
      name: [1, 2, 3],
      statusId: [1, 3],
      priority: "normal",
      deleted: "true",
    },
    {
      name: "cli",
      statusId: "aaa",
      priority: "normal",
      deleted: "true",
    },
    {
      name: "cli",
      statusId: [1, 3],
      priority: 123,
      deleted: "true",
    },
    {
      name: "clie",
      statusId: [1, 3],
      priority: "normal",
      deleted: { a: 48 },
    },
  ])(
    "should return 400 if at least one query param is invalid",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(
        typeof query.deleted !== "string" ? 2 : 1
      );
    }
  );

  it("should return 200 and the list of the tasks", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });

  it("should return 200 and the list of the tasks with the correct order", async () => {
    const res = await supertest(app)
      .get(url)
      .set("Cookie", cookie)
      .query({ orderBy: "name", dir: "desc", limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.tasks[0].name).toBe("Task 9");
  });

  it.each([
    { orderBy: "name", dir: "asc" },
    { orderBy: "name", dir: "desc" },
    { orderBy: "priority", dir: "asc" },
    { orderBy: "priority", dir: "desc" },
  ])(
    "should return 200 and the list of the tasks with the correct order - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(200);
    }
  );
});
