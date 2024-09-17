import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateUsers } from "../init-db";
import User from "../../db/models/user";

const url = "/api/v1/users/info";
var cookie: string;

describe(`PUT ${url}`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();

    // Populate the user table
    await populateUsers();

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
    const res = await supertest(app).put(url);

    expect(res.status).toBe(401);
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .put(url)
      .set("Cookie", cookie)
      .send({
        lastName: "D".repeat(300),
        firstName: ["John"],
        email: "john.doe example.com",
        roleId: { aaa: 1 },
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(4);

    expect(errors[0].field).toBe("firstName");
    expect(errors[0].name).toBe("type");
    expect(errors[0].value).toBe("string");

    expect(errors[1].field).toBe("lastName");
    expect(errors[1].name).toBe("max");
    expect(errors[1].value).toBe(255);

    expect(errors[2].field).toBe("email");
    expect(errors[2].name).toBe("email");

    expect(errors[3].field).toBe("roleId");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("number");
  });

  it("should return 400 if the user email already exists", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      email: "john.doe1@example.com",
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
    expect(errors[0].name).toBe("not_unique");
  });

  it("should return 200 if the user is updated", async () => {
    const res = await supertest(app).put(url).set("Cookie", cookie).send({
      lastName: "Doe Test",
      firstName: "John Test",
      email: "john.doe.test@example.com",
      roleId: 2,
    });

    const user = res.body.user;

    expect(res.status).toBe(200);
    expect(user.id).toBeDefined();
    expect(user.firstName).toBe("John Test");
    expect(user.lastName).toBe("Doe Test");
    expect(user.email).toBe("john.doe.test@example.com");
    expect(user.icon).toBeNull();
    expect(user.roleId).toBe(2);
  });
});
