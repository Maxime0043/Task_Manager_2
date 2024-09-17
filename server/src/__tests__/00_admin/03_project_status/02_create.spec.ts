import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const url = "/api/v1/admin/project_status";
var cookie: string;
var user: User;

describe(`POST ${url}`, () => {
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

  it.each([
    {
      label: "Test",
      color: "#FF0000",
    },
    {
      name: "test",
      color: "#FF0000",
    },
    {
      name: "test",
      label: "Test",
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = ["name", "label", "color"].find(
      (key) => !obj.hasOwnProperty(key)
    );

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .post(url)
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

  it("should return 201 if the projectStatus is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "test",
      label: "Test",
      color: "#FF0000",
    });

    const projectStatus = res.body.projectStatus;

    expect(res.status).toBe(201);
    expect(projectStatus.name).toBe("test");
    expect(projectStatus.label).toBe("Test");
  });

  it("should return 400 if the projectStatus already exists", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      name: "test",
      label: "Test",
      color: "#FF0000",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
    expect(errors[0].name).toBe("not_unique");
  });
});
