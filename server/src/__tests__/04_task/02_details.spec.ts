import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Project from "../../db/models/project";
import Client from "../../db/models/client";
import Task from "../../db/models/task";

const urlWithoutId = "/api/v1/tasks";
var url = urlWithoutId;
var cookie: string;

describe(`GET ${url}/:id`, () => {
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
    const res = await supertest(app).get(url);

    expect(res.status).toBe(401);
  });

  it("should return 404 if the task does not exist", async () => {
    const res = await supertest(app)
      .get(`${url.slice(0, -1)}0`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the task id is not a UUID", async () => {
    const res = await supertest(app)
      .get(`${urlWithoutId}/123`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 200 and the task details", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.task.id).toBeDefined();
    expect(res.body.task.name).toBe("Task 1");
    expect(res.body.task.timeEstimate).toBe("16.00");
    expect(res.body.task.deadline).toBeDefined();
    expect(res.body.task.percentDone).toBe(0);
    expect(res.body.task.statusId).toBe(1);
    expect(res.body.task.description).toBe("Description of the task 1");
    expect(res.body.task.priority).toBe("high");
    expect(res.body.task.position).toBe(1);
    expect(res.body.task.projectId).toBeDefined();
    expect(res.body.task.usersAssigned).toHaveLength(0);
  });
});
