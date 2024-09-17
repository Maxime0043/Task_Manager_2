import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

const url = "/api/v1/tasks/scheduled";
var cookie: string;
var userId: string;
var projectId: string;

describe(`POST ${url}`, () => {
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
    userId = user.id;

    // Create a client
    const client = await Client.create({
      name: "Client 1",
      email: "client1@example.com",
      description: "Description of the client 1",
      creatorId: user.id,
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
    projectId = project.id;

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
    const res = await supertest(app).post(url);

    expect(res.status).toBe(401);
  });

  it.each([
    {
      start: "08:00:00",
      end: "12:00:00",
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      date: "2024-09-01",
      end: "12:00:00",
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      date: "2024-09-01",
      start: "08:00:00",
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      date: "2024-09-01",
      start: "08:00:00",
      end: "12:00:00",
      userId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      date: "2024-09-01",
      start: "08:00:00",
      end: "12:00:00",
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = ["date", "start", "end", "projectId", "userId"].find(
      (key) => !obj.hasOwnProperty(key)
    );

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: "invalid-date",
      start: "invalid-time",
      end: "invalid-time",
      projectId: "invalid-uuid",
      userId: 123456,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(5);

    expect(errors[0].field).toBe("date");
    expect(errors[0].name).toBe("regex");

    expect(errors[1].field).toBe("start");
    expect(errors[1].name).toBe("regex");

    expect(errors[2].field).toBe("end");
    expect(errors[2].name).toBe("regex");

    expect(errors[3].field).toBe("projectId");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("uuid");

    expect(errors[4].field).toBe("userId");
    expect(errors[4].name).toBe("type");
    expect(errors[4].value).toBe("string");
  });

  it("should return 400 if the userId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      projectId,
      userId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("userId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the projectId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("projectId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the taskId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      taskId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("taskId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the taskId and the projectId are both defined", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      taskId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("projectId");
    expect(errors[0].name).toBe("useless");
  });

  it("should return 201 if the task is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      projectId,
      userId,
    });

    const taskScheduled = res.body.taskScheduled;

    expect(res.status).toBe(201);
    expect(taskScheduled.id).toBeDefined();
    expect(taskScheduled.date).toBe("2024-09-01");
    expect(taskScheduled.start).toBe("08:00:00");
    expect(taskScheduled.end).toBe("12:00:00");
    expect(taskScheduled.taskId).toBeUndefined();
    expect(taskScheduled.projectId).toBeDefined();
    expect(taskScheduled.userId).toBeDefined();
  });
});
