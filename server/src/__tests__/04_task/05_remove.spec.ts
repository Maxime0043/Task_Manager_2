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
var task: Task;

describe(`DELETE ${url}/:id`, () => {
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
      name: `My Client 1`,
      email: `myclient1@example.com`,
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

    // Create a task
    task = await Task.create({
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

    // Modify the URL to get the details of the project
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
    const res = await supertest(app).delete(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the task id is not a UUID", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the task is not found", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and remove the task", async () => {
    const res = await supertest(app).delete(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    const resDetails = await supertest(app).get(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);

    // Reload the task and check if it is deleted
    task = await task.reload({ paranoid: false });

    expect(task.deletedAt).toBeDefined();
  });

  it("should return 200 and remove the task definitely", async () => {
    const res = await supertest(app)
      .delete(url)
      .set("Cookie", cookie)
      .send({ definitely: true });

    expect(res.status).toBe(200);

    const resDetails = await supertest(app).get(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);

    // Reload the task and check if it is deleted
    const taskDeleted = await Task.findByPk(task.id, { paranoid: false });

    expect(taskDeleted).toBeNull();
  });
});
