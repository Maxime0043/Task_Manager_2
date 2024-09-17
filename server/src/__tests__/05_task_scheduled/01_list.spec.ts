import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateTaskScheduled } from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

const url = "/api/v1/tasks/scheduled";

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

    // Populate database with taskScheduled
    await populateTaskScheduled(user.id, project.id);

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
    { start: "", end: "2024-09-10T00:00:00.000Z" },
    { start: 123, end: "2024-09-10T00:00:00.000Z" },
    { start: null, end: "2024-09-10T00:00:00.000Z" },
    { start: undefined, end: "2024-09-10T00:00:00.000Z" },
    { start: "2024-09-10T00:00:00.000Z", end: "" },
    { start: "2024-09-10T00:00:00.000Z", end: 123 },
    { start: "2024-09-10T00:00:00.000Z", end: null },
    { start: "2024-09-10T00:00:00.000Z", end: undefined },
  ])(
    "should return 400 if the start or the end is not set or not a date in iso format - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query(query);

      expect(res.status).toBe(400);
      expect(res.body.errors[0].param).toMatch(/(start|end)/);
    }
  );

  it.each([
    {
      start: "a",
      end: "2021-01-01",
    },
    {
      start: "2021-01-01",
      end: "a",
    },
  ])(
    "should return 400 if at least one query param is invalid",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(1);
    }
  );

  it("should return 200 and the list of the taskScheduled", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 5,
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-12-31T23:59:59.000Z",
    });

    expect(res.status).toBe(200);
    expect(res.body.taskScheduled).toHaveLength(5);
  });

  it("should return 200 and the list of the taskScheduled with the correct order", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      orderBy: "date",
      dir: "desc",
      limit: 1,
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-12-31T23:59:59.000Z",
    });

    expect(res.status).toBe(200);
    expect(res.body.taskScheduled[0].date).toBe("2024-09-20");
  });

  it.each([
    { orderBy: "date", dir: "asc" },
    { orderBy: "date", dir: "desc" },
  ])(
    "should return 200 and the list of the taskScheduled with the correct order - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({
          limit: 1,
          start: "2024-01-01T00:00:00.000Z",
          end: "2024-12-31T23:59:59.000Z",
          ...query,
        });

      expect(res.status).toBe(200);
      expect(res.body.taskScheduled).toHaveLength(1);
    }
  );
});
