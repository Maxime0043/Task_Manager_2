import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateProjects } from "../init-db";
import User from "../../db/models/user";
import Client from "../../db/models/client";

const url = "/api/v1/projects";

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

    // Populate database with projects
    await populateProjects(user.id, client.id);

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
      name: [1, 2, 3],
      statusId: [1, 3],
      isInternalProject: "true",
      deleted: "true",
    },
    {
      name: "cli",
      statusId: "aaa",
      isInternalProject: "true",
      deleted: "true",
    },
    {
      name: "cli",
      statusId: [1, 3],
      isInternalProject: ["aaa", "bbb"],
      deleted: "true",
    },
    {
      name: "clie",
      statusId: [1, 3],
      isInternalProject: "true",
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

      if (
        typeof query.deleted !== "string" ||
        typeof query.isInternalProject !== "string"
      ) {
        expect(res.body.errors).toHaveLength(2);
      } else {
        expect(res.body.errors).toHaveLength(1);
      }
    }
  );

  it("should return 200 and the list of the projects", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(2);
  });

  it("should return 200 and the list of the projects with the correct order", async () => {
    const res = await supertest(app)
      .get(url)
      .set("Cookie", cookie)
      .query({ orderBy: "name", dir: "desc", limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.projects[0].name).toBe("Project 9");
  });

  it.each([
    { orderBy: "name", dir: "asc" },
    { orderBy: "name", dir: "desc" },
    { orderBy: "statusId", dir: "asc" },
    { orderBy: "statusId", dir: "desc" },
  ])(
    "should return 200 and the list of the projects with the correct order - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(200);
    }
  );
});
