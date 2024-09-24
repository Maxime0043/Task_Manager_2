import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateConversations, populateUsers } from "../init-db";
import User from "../../db/models/user";

var url = "/api/v1/messages";

var cookie: string;

describe(`GET ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Populate database with users and conversations
    await populateUsers();
    const conversation = await populateConversations();

    // Create a user
    await User.create({
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
    const res = await supertest(app).get(url);

    expect(res.status).toBe(401);
  });

  it.each([
    {},
    { limit: "a" },
    { limit: "" },
    { limit: null },
    { limit: undefined },
  ])(
    "should return 400 if the limit is not set or not a number - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query(query);

      expect(res.status).toBe(400);
      expect(res.body.errors[0].param).toBe("limit");
    }
  );

  it.each([
    {
      after: [1, 2, 3],
      before: "2024-12-31 00:00:00",
    },
    {
      after: "invalid-date",
      before: "2024-12-31 00:00:00",
    },
    {
      after: "2024-01-01 00:00:00",
      before: [1, 2, 3],
    },
    {
      after: "2024-01-01 00:00:00",
      before: "invalid-date",
    },
  ])(
    "should return 400 if at least one query param is invalid",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(1);
    }
  );

  it("should return 200 and the list of the messages", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(2);
  });
});
