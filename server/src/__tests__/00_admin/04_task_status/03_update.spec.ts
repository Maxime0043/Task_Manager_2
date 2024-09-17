import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const urlWithoutId = "/api/v1/admin/task_status";
var url = urlWithoutId + "/1";
var cookie: string;
var user: User;

describe(`PUT ${urlWithoutId}/:id`, () => {
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
    const res = await supertest(app).put(url);

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

  it("should return 400 if the taskStatus id is not an Integer", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/aaa`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the taskStatus is not found", async () => {
    const res = await supertest(app)
      .put(`${urlWithoutId}/99`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .put(url)
      .set("Cookie", cookie)
      .send({
        name: "c".repeat(300),
        label: ["test"],
        color: "FF0000",
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(3);

    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("max");
    expect(errors[0].value).toBe(255);

    expect(errors[1].field).toBe("label");
    expect(errors[1].name).toBe("type");
    expect(errors[1].value).toBe("string");

    expect(errors[2].field).toBe("color");
    expect(errors[2].name).toBe("regex");
  });

  it("should return 400 if the taskStatus name already exists", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      name: "in_progress",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("not_unique");
  });

  it("should return 200 if the taskStatus is updated", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      name: "test",
      label: "Test",
      color: "#0000FF",
    });

    const taskStatus = res.body.taskStatus;

    expect(res.status).toBe(200);
    expect(taskStatus.name).toBe("test");
    expect(taskStatus.label).toBe("Test");
    expect(taskStatus.color).toBe("#0000FF");
  });
});
