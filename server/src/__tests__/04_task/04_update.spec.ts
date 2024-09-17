import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";
import Task from "../../db/models/task";

const urlWithoutId = "/api/v1/tasks";
var url = urlWithoutId;
var cookie: string;
var userId2: string;

describe(`PUT ${url}/:id`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Create users
    const user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });
    const otherUser = await User.create({
      lastName: "Smith",
      firstName: "Jane",
      email: "jane.smith@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });
    userId2 = otherUser.id;

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

    // Create a task
    const task = await Task.create({
      name: `Task 1`,
      timeEstimate: "16.00",
      deadline: "2024-09-12 09:30:00",
      percentDone: 0,
      statusId: 1,
      description: `Description of the task 1`,
      priority: "high",
      position: 1,
      projectId: project.id,
      creatorId: user.id,
      usersAssigned: [user.id],
    });

    // Modify the URL to get the details of the task
    url = `${url}/${task.id}`;

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

  it("should return 400 if the task id is not a UUID", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the task is not found", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/353f3f22-76df-4bf2-b3de-97f05ed30c3a`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .put(url)
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
        usersAssigned: ["invalid-uuid"],
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

    expect(errors[8].field).toBe("usersAssigned[0]");
    expect(errors[8].name).toBe("type");
    expect(errors[8].value).toBe("uuid");
  });

  it("should return 200 if the task is updated", async () => {
    const res = await supertest(app)
      .put(url)
      .set("Cookie", cookie)
      .send({
        name: `Task 1 Modified`,
        timeEstimate: "18.00",
        deadline: "2024-09-12 09:30:00",
        percentDone: 25,
        statusId: 2,
        description: `Description of the task 1 modified`,
        priority: "normal",
        position: 2,
        usersAssigned: [userId2],
      });

    const task = res.body.task;

    expect(res.status).toBe(200);
    expect(task.name).toBe("Task 1 Modified");
    expect(Number.parseFloat(task.timeEstimate)).toBe(18);
    expect(task.deadline).toBeDefined();
    expect(task.percentDone).toBe(25);
    expect(task.statusId).toBe(2);
    expect(task.description).toBe("Description of the task 1 modified");
    expect(task.priority).toBe("normal");
    expect(task.position).toBe(2);
    expect(task.usersAssigned).toHaveLength(1);
  });
});
