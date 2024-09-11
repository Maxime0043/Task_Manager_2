import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

const url = "/api/v1/tasks";
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
      timeEstimate: 16,
      statusId: 1,
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      statusId: 1,
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      timeEstimate: 16,
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      timeEstimate: 16,
      statusId: 1,
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      timeEstimate: 16,
      statusId: 1,
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = [
      "name",
      "timeEstimate",
      "statusId",
      "projectId",
      "creatorId",
    ].find((key) => !obj.hasOwnProperty(key));

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .post(url)
      .set("Cookie", cookie)
      .send({
        name: "c".repeat(300),
        timeEstimate: [1, 2, 3],
        deadline: "aaa",
        percentDone: { value: 50 },
        statusId: { id: 1 },
        priority: "invalid",
        position: -1,
        projectId: 123456,
        creatorId: "invalid-uuid",
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(9);

    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("max");
    expect(errors[0].value).toBe(255);

    expect(errors[1].field).toBe("timeEstimate");
    expect(errors[1].name).toBe("type");
    expect(errors[1].value).toBe("number");

    expect(errors[2].field).toBe("deadline");
    expect(errors[2].name).toBe("type");
    expect(errors[2].value).toBe("date.iso");

    expect(errors[3].field).toBe("percentDone");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("number");

    expect(errors[4].field).toBe("statusId");
    expect(errors[4].name).toBe("type");
    expect(errors[4].value).toBe("number");

    expect(errors[5].field).toBe("priority");
    expect(errors[5].name).toBe("mismatched");

    expect(errors[6].field).toBe("position");
    expect(errors[6].name).toBe("min");
    expect(errors[6].value).toBe(0);

    expect(errors[7].field).toBe("projectId");
    expect(errors[7].name).toBe("type");
    expect(errors[7].value).toBe("string");

    expect(errors[8].field).toBe("creatorId");
    expect(errors[8].name).toBe("type");
    expect(errors[8].value).toBe("uuid");
  });

  it("should return 400 if the creatorId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: `Task 1`,
      timeEstimate: 16,
      statusId: 1,
      projectId,
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("creatorId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the projectId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: `Task 1`,
      timeEstimate: 16,
      statusId: 1,
      projectId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("projectId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the statusId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: `Task 1`,
      timeEstimate: 16,
      statusId: 99999,
      projectId,
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("statusId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 201 if the task is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: `Task 1`,
      timeEstimate: "16.00",
      deadline: "2024-09-12 09:30:00",
      percentDone: 0,
      statusId: 1,
      description: `Description of the task 1`,
      priority: "high",
      position: 1,
      projectId,
      creatorId: userId,
    });

    const task = res.body.task;

    expect(res.status).toBe(201);
    expect(task.name).toBe("Task 1");
    expect(task.timeEstimate).toBe(16);
    expect(task.deadline).toBeDefined();
    expect(task.percentDone).toBe(0);
    expect(task.statusId).toBe(1);
    expect(task.description).toBe("Description of the task 1");
    expect(task.priority).toBe("high");
    expect(task.position).toBe(1);
    expect(task.projectId).toBe(projectId);
    expect(task.creatorId).toBe(userId);
  });
});
