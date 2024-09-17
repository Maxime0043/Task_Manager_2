import "../../init-tests";

import supertest from "supertest";
import app from "../../../api";

import db from "../../../db/models/index";
import initDB from "../../init-db";
import User from "../../../db/models/user";

const url = "/api/v1/admin/users";
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
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    },
    {
      lastName: "Doe",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      roleId: 1,
      isAdmin: false,
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      isAdmin: false,
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    },
  ])("should return 400 if an element is not provided", async (obj) => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send(obj);
    const errors = res.body.errors;

    const field = [
      "firstName",
      "lastName",
      "email",
      "password",
      "passwordConfirmation",
      "roleId",
      "isAdmin",
    ].find((key) => !obj.hasOwnProperty(key));

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(field === "password" ? 2 : 1);
    expect(errors[0].field).toBe(field);
    expect(errors[0].name).toBe("required");
  });

  it("should return 400 if the fields are invalid", async () => {
    const res = await supertest(app)
      .post(url)
      .set("Cookie", cookie)
      .send({
        lastName: "c".repeat(300),
        firstName: 333,
        email: "jane.doe example.com",
        password: { value: "password" },
        passwordConfirmation: 123,
        roleId: "aaa",
        isAdmin: [true],
      });
    const errors = res.body.errors;

    expect(res.status).toBe(400);
    expect(errors).toHaveLength(8);

    expect(errors[0].field).toBe("firstName");
    expect(errors[0].name).toBe("type");
    expect(errors[0].value).toBe("string");

    expect(errors[1].field).toBe("lastName");
    expect(errors[1].name).toBe("max");
    expect(errors[1].value).toBe(255);

    expect(errors[2].field).toBe("email");
    expect(errors[2].name).toBe("email");

    expect(errors[3].field).toBe("password");
    expect(errors[3].name).toBe("type");
    expect(errors[3].value).toBe("string");

    expect(errors[4].field).toBe("passwordConfirmation");
    expect(errors[4].name).toBe("mismatched");

    expect(errors[5].field).toBe("passwordConfirmation");
    expect(errors[5].name).toBe("type");
    expect(errors[5].value).toBe("string");

    expect(errors[6].field).toBe("roleId");
    expect(errors[6].name).toBe("type");
    expect(errors[6].value).toBe("number");

    expect(errors[7].field).toBe("isAdmin");
    expect(errors[7].name).toBe("type");
    expect(errors[7].value).toBe("boolean");
  });

  it("should return 400 if the roleId is invalid", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 999,
      isAdmin: false,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("roleId");
    expect(errors[0].name).toBe("foreign_key");
  });

  it("should return 201 if the user is created", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    });

    const user = res.body.user;

    expect(res.status).toBe(201);
    expect(user.lastName).toBe("Doe");
    expect(user.firstName).toBe("Jane");
    expect(user.email).toBe("jane.doe@example.com");
    expect(user.roleId).toBe(1);
    expect(user.isAdmin).toBe(false);
  });

  it("should return 400 if the user email already exists", async () => {
    const res = await supertest(app).post(url).set("Cookie", cookie).send({
      lastName: "Doe",
      firstName: "Jane",
      email: "jane.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
      isAdmin: false,
    });
    const errors = res.body.errors;

    expect(res.status).toBe(409);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
    expect(errors[0].name).toBe("not_unique");
  });
});
