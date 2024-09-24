import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const urlWithoutId = "/api/v1/admin/users/restore";
var url = urlWithoutId;
var cookie: string;
var user: User;
var user2: User;

describe(`POST ${url}/:id`, () => {
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
    user2 = await User.create({
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      deleteAt: new Date(),
    });

    // Modify the URL to get the details of the user
    url = `${url}/${user2.id}`;

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

  it("should return 403 if the user is not an admin", async () => {
    // Update the user to remove the admin role
    await user.update({ isAdmin: false });

    // Request
    const res = await supertest(app).get(url).set("Cookie", cookie);

    expect(res.status).toBe(403);

    // Restore the user to admin
    await user.update({ isAdmin: true });
  });

  it("should return 400 if the user id is not a UUID", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the user is not found", async () => {
    const res = await supertest(app)
      .post(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and restore the user", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    // Check if the user is restored
    await user2.reload();

    expect(user2.deletedAt).toBeNull();
  });
});
