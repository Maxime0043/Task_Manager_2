import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";
import Client from "../../../db/models/client";
import Project from "../../../db/models/project";
import Task from "../../../db/models/task";

const urlWithoutId = "/api/v1/admin/task_status";
var url = urlWithoutId + "/1";
var cookie: string;
var user: User;
var task: Task;

describe(`DELETE ${urlWithoutId}/:id`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Create a user
    user = await User.create({
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

  it("should return 403 if the user is not an admin", async () => {
    // Update the user to remove the admin role
    await user.update({ isAdmin: false });

    // Request
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(403);

    // Restore the user to admin
    await user.update({ isAdmin: true });
  });

  it("should return 400 if the taskStatus id is not an Integer", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/aaa`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the taskStatus is not found", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/999`)
      .set("Cookie", cookie)
      .send({
        statusId: 2,
      });

    expect(res.status).toBe(404);
  });

  it.each([{}])(
    "should return 400 if an element is not provided",
    async (obj) => {
      const res = await supertest(app)
        .delete(url)
        .set("Cookie", cookie)
        .send(obj);
      const errors = res.body.errors;

      expect(res.status).toBe(400);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("statusId");
      expect(errors[0].name).toBe("required");
    }
  );

  it("should return 200 and remove the taskStatus", async () => {
    const res = await supertest(app).delete(url).set("Cookie", cookie).send({
      statusId: 2,
    });

    expect(res.status).toBe(200);

    // Check the taskStatus has been removed
    const resDetails = await supertest(app).get(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);

    // Check if the taskStatus has been modified in the task
    await task.reload();

    expect(task.statusId).toBe(2);
  });
});
