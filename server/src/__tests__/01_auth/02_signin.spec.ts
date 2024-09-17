import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/auth/signin";

describe(`POST ${url}`, () => {
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
  });

  afterAll(async () => {
    // Close the database connection
    await db.sequelize.close();
  });

  it.each([
    {
      password: "password",
    },
    {
      email: "john.doe@example.com",
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).send(obj);
    const errors = res.body.errors;

    const field = ["email", "password"].find((key) => !obj.hasOwnProperty(key));

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app).post(url).send({
      email: "john.doe",
      password: "123",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(2);

    expect(errors[0].field).toBe("email");
    expect(errors[0].name).toBe("email");

    expect(errors[1].field).toBe("password");
    expect(errors[1].name).toBe("min");
    expect(errors[1].value).toBe(6);
  });

  it("should return 401 if the user does not exist", async () => {
    const res = await supertest(app).post(url).send({
      email: "jane.doe@example.com",
      password: "password",
    });

    expect(res.status).toBe(401);
  });

  it("should return 401 if the password is incorrect", async () => {
    const res = await supertest(app).post(url).send({
      email: "john.doe@example.com",
      password: "123456",
    });

    expect(res.status).toBe(401);
  });

  it("should return 200 if the user information are correct", async () => {
    const res = await supertest(app).post(url).send({
      email: "john.doe@example.com",
      password: "password",
    });

    expect(res.status).toBe(200);
    expect(res.header).toHaveProperty("set-cookie");
    expect(res.header["set-cookie"]).toHaveLength(1);
    expect(res.header["set-cookie"][0]).toMatch(/^connect\.sid=/);
  });
});
