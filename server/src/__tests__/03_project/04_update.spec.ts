import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

const urlWithoutId = "/api/v1/projects";
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

    // Modify the URL to get the details of the project
    url = `${url}/${project.id}`;

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

  it("should return 400 if the project id is not a UUID", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the project is not found", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .put(url)
      .set("Cookie", cookie)
      .send({
        name: "c".repeat(300),
        statusId: { id: 1 },
        isInternalProject: [true],
        managerId: "invalid-uuid",
        clientId: 123456,
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(5);

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
  });

  it("should return 200 if the project is updated", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      name: "My Project 1 Modified",
      statusId: 2,
      budget: 12345.67,
      isInternalProject: false,
      description: "Description of the project 1 modified",
    });

    const project = res.body.project;

    expect(res.status).toBe(200);
    expect(project.name).toBe("My Project 1 Modified");
    expect(project.statusId).toBe(2);
    expect(project.budget).toBe(12345.67);
    expect(project.description).toBe("Description of the project 1 modified");
  });
});
