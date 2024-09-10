import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";

const url = "/api/v1/projects";
var cookie: string;
var userId: string;
var clientId: string;

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
    clientId = client.id;

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
      statusId: 1,
      isInternalProject: true,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      isInternalProject: true,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      statusId: 1,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = [
      "name",
      "statusId",
      "isInternalProject",
      "managerId",
      "clientId",
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
        statusId: { id: 1 },
        isInternalProject: [true],
        managerId: "invalid-uuid",
        clientId: 123456,
        creatorId: { aaa: "bbb" },
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(6);

    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("max");
    expect(errors[0].value).toBe(255);

    expect(errors[1].field).toBe("statusId");
    expect(errors[1].name).toBe("type");
    expect(errors[1].value).toBe("number");

    expect(errors[2].field).toBe("isInternalProject");
    expect(errors[2].name).toBe("type");
    expect(errors[2].value).toBe("boolean");

    expect(errors[3].field).toBe("managerId");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("uuid");

    expect(errors[4].field).toBe("clientId");
    expect(errors[4].name).toBe("type");
    expect(errors[4].value).toBe("string");

    expect(errors[5].field).toBe("creatorId");
    expect(errors[5].name).toBe("type");
    expect(errors[5].value).toBe("string");
  });

  it("should return 400 if the creatorId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      managerId: userId,
      clientId: clientId,
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("creatorId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the managerId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      managerId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      clientId: clientId,
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("managerId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the clientId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      managerId: userId,
      clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("clientId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 400 if the statusId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Project 1",
      statusId: 99999,
      isInternalProject: true,
      managerId: userId,
      clientId: clientId,
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("statusId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 201 if the project is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Project 1",
      statusId: 1,
      isInternalProject: true,
      description: "Description of the project 1",
      managerId: userId,
      clientId: clientId,
      creatorId: userId,
    });

    const project = res.body.project;

    expect(res.status).toBe(201);
    expect(project.name).toBe("Project 1");
    expect(project.statusId).toBe(1);
    expect(project.isInternalProject).toBe(true);
    expect(project.creatorId).toBe(userId);
    expect(project.managerId).toBe(userId);
    expect(project.clientId).toBe(clientId);
  });
});
