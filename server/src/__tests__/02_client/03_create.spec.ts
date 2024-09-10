import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/clients";
var cookie: string;
var userId: string;

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
    userId = user.id;

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
      email: "client1@example.com",
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Client 1",
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    },
    {
      name: "Client 1",
      email: "client1@example.com",
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = ["name", "email", "creatorId"].find(
      (key) => !obj.hasOwnProperty(key)
    );

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
        email: "client1 example.com",
        phone: "invalid-phone",
        description: 123,
        creatorId: "aaa",
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(5);

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

    expect(errors[4].field).toBe("creatorId");
    expect(errors[4].name).toBe("type");
    expect(errors[4].value).toBe("uuid");
  });

  it("should return 400 if the creatorId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Client 1",
      email: "client1@example.com",
      description: "Description of the client 1",
      creatorId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a", // random UUID
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("creatorId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 201 if the client is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Client 1",
      email: "client1@example.com",
      description: "Description of the client 1",
      creatorId: userId,
    });

    const client = res.body.client;

    expect(res.status).toBe(201);
    expect(client.name).toBe("Client 1");
    expect(client.email).toBe("client1@example.com");
    expect(client.creatorId).toBe(userId);
  });

  it("should return 400 if the client already exists", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "Client 2",
      email: "client1@example.com",
      description: "Description of the client 2",
      creatorId: userId,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
    expect(errors[0].name).toBe("not_unique");
  });
});
