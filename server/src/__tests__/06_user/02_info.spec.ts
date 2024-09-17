import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/users/info";
var cookie: string;

describe(`GET ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

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

  it("should return 200 and the user details", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.firstName).toBe("John");
    expect(res.body.user.lastName).toBe("Doe");
    expect(res.body.user.email).toBe("john.doe@example.com");
    expect(res.body.user.icon).toBeNull();
    expect(res.body.user.roleId).toBe(1);
  });
});
