import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";
import Project from "../../db/models/project";

var urlDetails = "/api/v1/projects";
const urlWithoutId = "/api/v1/projects/restore";
var url = urlWithoutId;
var cookie: string;

describe(`POST ${url}/:id`, () => {
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

    // Create a deleted project
    const project = await Project.create({
      name: "Project 1",
      statusId: 1,
      budget: Math.floor(Math.random() * 100000),
      description: "Description of the project 1",
      isInternalProject: true,
      managerId: user.id,
      clientId: client.id,
      creatorId: user.id,
      deletedAt: new Date(),
    });

    // Modify the URL to get the details of the project
    urlDetails = `${urlDetails}/${project.id}`;
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
    const res = await supertest(app).post(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the project id is not a UUID", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the project is not found", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and restore the project", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    const resDetails = await supertest(app)
      .get(urlDetails)
      .set("Cookie", cookie);

    expect(resDetails.status).toBe(200);
  });
});
