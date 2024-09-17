import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";
import TaskScheduled from "./../../db/models/task_scheduled";

const urlWithoutId = "/api/v1/tasks/scheduled";
var url = urlWithoutId;
var cookie: string;

describe(`PUT ${url}/:id`, () => {
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

    // Create a taskScheduled
    const taskScheduled = await TaskScheduled.create({
      date: `2024-09-01`,
      start: "08:00:00",
      end: "12:00:00",
      taskId: null,
      projectId: project.id,
      userId: user.id,
    });

    // Modify the URL to get the details of the task
    url = `${url}/${taskScheduled.id}`;

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
    const res = await supertest(app).put(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the taskScheduled id is not a UUID", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the taskScheduled is not found", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      date: "invalid-date",
      start: "invalid-time",
      end: "invalid-time",
      projectId: "invalid-uuid",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(4);

    expect(errors[0].field).toBe("date");
    expect(errors[0].name).toBe("regex");

    expect(errors[1].field).toBe("start");
    expect(errors[1].name).toBe("regex");

    expect(errors[2].field).toBe("end");
    expect(errors[2].name).toBe("regex");

    expect(errors[3].field).toBe("projectId");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("uuid");
  });

  it("should return 200 if the task is updated", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      date: "2024-09-02",
      start: "15:00:00",
      end: "18:00:00",
    });

    const taskScheduled = res.body.taskScheduled;

    expect(res.status).toBe(200);
    expect(taskScheduled.date).toBe("2024-09-02");
    expect(taskScheduled.start).toBe("15:00:00");
    expect(taskScheduled.end).toBe("18:00:00");
  });
});
