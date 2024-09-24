import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateClients } from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";

const urlWithoutId = "/api/v1/clients";
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

    // Populate database with clients
    await populateClients(user.id);

    // Create a client
    const client = await Client.create({
      name: `My Client 1`,
      email: `myclient1@example.com`,
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
    const res = await supertest(app).put(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the client id is not a UUID", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the client is not found", async () => {
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
        email: "client1 example.com",
        phone: "invalid-phone",
        description: 123,
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(4);

    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("max");
    expect(errors[0].value).toBe(255);

    expect(errors[1].field).toBe("email");
    expect(errors[1].name).toBe("email");

    expect(errors[2].field).toBe("phone");
    expect(errors[2].name).toBe("regex");

    expect(errors[3].field).toBe("description");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("string");
  });

  it("should return 400 if the client email already exists", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      email: "client1@example.com",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
    expect(errors[0].name).toBe("not_unique");
  });

  it("should return 200 if the client is updated", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      name: "My Client 1 Modified",
      email: "myclient1modified@example.com",
      phone: "+33 6 12 34 56 78",
      description: "Description of the client 1 modified",
    });

    const client = res.body.client;

    expect(res.status).toBe(200);
    expect(client.name).toBe("My Client 1 Modified");
    expect(client.email).toBe("myclient1modified@example.com");
    expect(client.phone).toBe("+33 6 12 34 56 78");
    expect(client.description).toBe("Description of the client 1 modified");
  });
});
