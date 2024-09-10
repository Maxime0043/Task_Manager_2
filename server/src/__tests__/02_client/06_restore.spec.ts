import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";

var urlDetails = "/api/v1/clients";
const urlWithoutId = "/api/v1/clients/restore";
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

    // Create a deleted client
    const client = await Client.create({
      name: `My Client 1`,
      email: `myclient1@example.com`,
      description: `Description of the client 1`,
      creatorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    });

    // Modify the URL to get the details of the client
    urlDetails = `${urlDetails}/${client.id}`;
    url = `${url}/${client.id}`;

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

  it("should return 400 if the client id is not a UUID", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the client is not found", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/353f3f22-76df-4bf2-b3de-97f05ed30c3a`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and restore the client", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    const resDetails = await supertest(app)
      .get(urlDetails)
      .set("Cookie", cookie);

    expect(resDetails.status).toBe(200);
  });
});
