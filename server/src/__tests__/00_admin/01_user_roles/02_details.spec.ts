import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const urlWithoutId = "/api/v1/admin/user_roles";
var url = `${urlWithoutId}/1`;
var cookie: string;
var user: User;

describe(`GET ${url}/:id`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Create a user
    user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: true,
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

  it("should return 403 if the user is not an admin", async () => {
    // Update the user to remove the admin role
    await user.update({ isAdmin: false });

    // Request
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(403);

    // Restore the user to admin
    await user.update({ isAdmin: true });
  });

  it("should return 404 if the userRole does not exist", async () => {
    const res = await supertest(app)
      .get(`${urlWithoutId}/999`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the userRole id is not an Integer", async () => {
    const res = await supertest(app)
      .get(`${urlWithoutId}/aaa`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 200 and the userRole details", async () => {
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.userRole.name).toBe("developer");
    expect(res.body.userRole.label).toBe("Developer");
  });
});
