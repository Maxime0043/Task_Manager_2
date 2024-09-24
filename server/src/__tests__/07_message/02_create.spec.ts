import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateConversations } from "../init-db";
import User from "../../db/models/user";

var url = "/api/v1/messages";
var cookie: string;

describe(`POST ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();
    const conversation = await populateConversations();

    // Create a user
    const user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });

    // Sign in the user
    const res = await supertest(app).post("/api/v1/auth/signin").send({
      email: "john.doe@example.com",
      password: "password",
    });

    // Save the cookie to use it later to authenticate
    cookie = res.header["set-cookie"];

    // Modify the URL
    url = `${url}/${conversation.id}`;
  });

  afterAll(async () => {
    // Close the database connection
    await db.sequelize.close();
  });

  it("should return 401 if the user is not authenticated", async () => {
    const res = await supertest(app).post(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .post(url)
      .set("Cookie", cookie)
      .send({
        content: ["This is a message"],
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);

    expect(errors[0].field).toBe("content");
    expect(errors[0].name).toBe("type");
    expect(errors[0].value).toBe("string");
  });

  it("should return 201 if the message is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      content: "This is a message",
    });

    const message = res.body.message;

    expect(res.status).toBe(201);
    expect(message.id).toBeDefined();
    expect(message.content).toBe("This is a message");
  });
});
