import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";

const urlWithoutId = "/api/v1/clients";
var url = urlWithoutId;
var cookie: string;

describe(`GET ${url}`, () => {
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
      name: `Client 1`,
      email: `client1@example.com`,
      description: `Description of the client 1`,
      creatorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Modify the URL to get the details of the client
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
    const res = await supertest(app).get(url);

    expect(res.status).toBe(401);
  });

  it("should return 404 if the client does not exist", async () => {
    const res = await supertest(app)
      .get(`${url.slice(0, -1)}0`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the client id is not a UUID", async () => {
    const res = await supertest(app)
      .get(`${urlWithoutId}/123`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 200 and the client details", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.client.id).toBeDefined();
    expect(res.body.client.name).toBe("Client 1");
    expect(res.body.client.email).toBe("client1@example.com");
  });
});
