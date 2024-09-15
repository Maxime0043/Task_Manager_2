import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const urlWithoutId = "/api/v1/admin/user_roles";
var url = urlWithoutId + "/1";
var cookie: string;
var user: User;

describe(`DELETE ${urlWithoutId}/:id`, () => {
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
    const res = await supertest(app).delete(url);

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

  it("should return 400 if the userRole id is not an Integer", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/aaa`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the userRole is not found", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/999`)
      .set("Cookie", cookie)
      .send({
        roleId: 2,
      });

    expect(res.status).toBe(404);
  });

  it.each([{}])(
    "should return 400 if an element is not provided",
    async (obj) => {
      const res = await supertest(app)
        .delete(url)
        .set("Cookie", cookie)
        .send(obj);
      const errors = res.body.errors;

      expect(res.status).toBe(400);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("roleId");
      expect(errors[0].name).toBe("required");
    }
  );

  it("should return 200 and remove the userRole", async () => {
    const res = await supertest(app).delete(url).set("Cookie", cookie).send({
      roleId: 2,
    });

    expect(res.status).toBe(200);

    // Check the userRole has been removed
    const resDetails = await supertest(app).get(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);

    // Check if the userRole has been modified in the user
    await user.reload();

    expect(user.roleId).toBe(2);
  });
});
