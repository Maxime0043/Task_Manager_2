import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateUsers } from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/users";

var cookie: string;

describe(`GET ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Populate database with users
    await populateUsers();

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
      lastName: [1, 2, 3],
      firstName: "cli",
      email: "client2",
      isAdmin: "false",
      deleted: "true",
    },
    {
      lastName: "cli",
      firstName: [1, 2, 3],
      email: "client2",
      isAdmin: "false",
      deleted: "true",
    },
    {
      lastName: "cli",
      firstName: "cli",
      email: ["aaa", "bbb"],
      isAdmin: "false",
      deleted: "true",
    },
    {
      lastName: "clie",
      firstName: "cli",
      email: "client2",
      isAdmin: { a: 48 },
      deleted: "true",
    },
    {
      lastName: "clie",
      firstName: "cli",
      email: "client2",
      isAdmin: "false",
      deleted: { a: 48 },
    },
  ])(
    "should return 400 if at least one query param is invalid",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(
        typeof query.deleted !== "string" || typeof query.isAdmin !== "string"
          ? 2
          : 1
      );
    }
  );

  it("should return 200 and the list of the users", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
  });

  it("should return 200 and the list of the users with the correct order", async () => {
    const res = await supertest(app)
      .get(url)
      .set("Cookie", cookie)
      .query({ orderBy: "firstName", dir: "desc", limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.users[0].firstName).toBe("John 9");
  });

  it.each([
    { orderBy: "lastName", dir: "asc" },
    { orderBy: "firstName", dir: "desc" },
    { orderBy: "email", dir: "asc" },
    { orderBy: "email", dir: "desc" },
  ])(
    "should return 200 and the list of the users with the correct order - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(200);
    }
  );
});
