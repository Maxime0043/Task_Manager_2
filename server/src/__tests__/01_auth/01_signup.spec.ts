import dotenv from "dotenv";

dotenv.config();

process.env.ENV_TYPE = "test";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/auth/signup";

describe(`POST ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();
  });

  afterAll(async () => {
    // Close the database connection
    await db.sequelize.close();
  });

  it.each([
    {
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    },
    {
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    },
    {
      lastName: "Doe",
      firstName: "John",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    },
    {
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      passwordConfirmation: "password",
      roleId: 1,
    },
    {
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      roleId: 1,
    },
    {
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).send(obj);
    const errors = res.body.errors;

    const field = [
      "lastName",
      "firstName",
      "email",
      "password",
      "passwordConfirmation",
      "roleId",
    ].find((key) => !obj.hasOwnProperty(key));

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(field === "password" ? 2 : 1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .post(url)
      .send({
        lastName: 45213654531.214313,
        firstName: "a".repeat(256),
        email: "john.doe",
        password: "123",
        passwordConfirmation: "123",
        roleId: "aaa",
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(5);

    expect(errors[0].field).toBe("lastName");
    expect(errors[0].name).toBe("type");
    expect(errors[0].value).toBe("string");

    expect(errors[1].field).toBe("firstName");
    expect(errors[1].name).toBe("max");
    expect(errors[1].value).toBe(255);

    expect(errors[2].field).toBe("email");
    expect(errors[2].name).toBe("email");

    expect(errors[3].field).toBe("password");
    expect(errors[3].name).toBe("min");
    expect(errors[3].value).toBe(6);

    expect(errors[4].field).toBe("roleId");
    expect(errors[4].name).toBe("type");
    expect(errors[4].value).toBe("number");
  });

  it("should return 400 if password and passwordConfirmation do not match", async () => {
    const res = await supertest(app).post(url).send({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "123456",
      passwordConfirmation: "123",
      roleId: 1,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("passwordConfirmation");
    expect(errors[0].name).toBe("mismatched");
    expect(errors[0].value).toBe("password");
  });

  it("should return 400 if the roleId is invalid", async () => {
    const res = await supertest(app).post(url).send({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 12,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("roleId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 201 if the user is created", async () => {
    const res = await supertest(app).post(url).send({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });

    expect(res.status).toBe(201);
  });

  it("should return 400 if the email is already taken", async () => {
    const res = await supertest(app).post(url).send({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });

    expect(res.status).toBe(409);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].field).toBe("email");
    expect(res.body.errors[0].name).toBe("not_unique");
  });
});
