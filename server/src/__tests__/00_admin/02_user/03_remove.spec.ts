import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const urlWithoutId = "/api/v1/admin/users";
var url = urlWithoutId;
var cookie: string;
var user: User;

describe(`DELETE ${url}/:id`, () => {
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
    const user2 = await User.create({
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
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
    const res = await supertest(app).delete(url);

    expect(res.status).toBe(401);
  });

  it("should return 403 if the user is not an admin", async () => {
    // Update the user to remove the admin role
    await user.update({ isAdmin: false });

    // Request
    const res = await supertest(app).delete(url).set("Cookie", cookie);

    expect(res.status).toBe(403);

    // Restore the user to admin
    await user.update({ isAdmin: true });
  });

  it("should return 400 if the user id is not a UUID", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the user is not found", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/353f3f22-76df-4bf2-b3de-97f05ed30c3a`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and remove the user", async () => {
    const res = await supertest(app).delete(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    const resDetails = await supertest(app).get(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);
  });
});
