import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB, { populateUserRoles } from "../../init-db";
import User from "../../../db/models/user";

const url = "/api/v1/admin/user_roles";

var user: User;
var cookie: string;

describe(`GET ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Populate database with userRoles
    await populateUserRoles();

    // Create a user admin
    user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      isAdmin: true,
      roleId: 1,
    });

    // Sign in the admin user
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

  it("should return 403 if the user is not an admin", async () => {
    // Update the user to remove the admin role
    await user.update({ isAdmin: false });

    // Request
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(403);

    // Restore the user to admin
    await user.update({ isAdmin: true });
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

  it.each([{ label: null }])(
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

  it("should return 200 and the list of the userRoles", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie).query({
      limit: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.userRoles).toHaveLength(2);
  });

  it("should return 200 and the list of the userRoles with the correct order", async () => {
    const res = await supertest(app)
      .get(url)
      .set("Cookie", cookie)
      .query({ orderBy: "name", dir: "desc", limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.userRoles[0].label).toBe("Role 9");
  });

  it.each([
    { orderBy: "name", dir: "asc" },
    { orderBy: "name", dir: "desc" },
    { orderBy: "label", dir: "asc" },
    { orderBy: "label", dir: "desc" },
  ])(
    "should return 200 and the list of the userRoles with the correct order - %p",
    async (query) => {
      const res = await supertest(app)
        .get(url)
        .set("Cookie", cookie)
        .query({ limit: 1, ...query });

      expect(res.status).toBe(200);
    }
  );
});
