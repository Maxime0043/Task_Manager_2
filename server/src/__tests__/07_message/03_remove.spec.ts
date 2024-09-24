import "../init-tests";

import supertest from "supertest";
import app from "../../api";

import db from "../../db/models/index";
import initDB, { populateConversations } from "../init-db";
import User from "../../db/models/user";
import Message from "../../db/models/message";

var urlWithoutId = "/api/v1/messages";
var url = urlWithoutId;
var cookie: string;
var message: Message;

describe(`DELETE ${url}/:id`, () => {
  beforeAll(async () => {
    // Sync the database
    await db.sequelize.sync({ force: true });

    // Initialize the database
    await initDB();
    const conversation = await populateConversations();

    // Create a user
    const user = await User.create({
      lastName: "Doe",
      firstName: "John",
      email: "john.doe@example.com",
      password: "password",
      passwordConfirmation: "password",
      roleId: 1,
    });

    // Retrieve the conversationUser
    const conversationUser = await conversation.$get("conversationUsers");

    // Create a message
    message = await Message.create({
      content: "This is a message",
      userId: conversationUser!.aUserId,
      conversationId: conversation.id,
    });

    // Modify the URL
    urlWithoutId = `${urlWithoutId}/${conversation.id}`;
    url = `${url}/${conversation.id}/${message.id}`;

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

  it("should return 400 if the message id is not a UUID", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/invalid-uuid`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("should return 404 if the message is not found", async () => {
    const res = await supertest(app)
      .delete(`${urlWithoutId}/${crypto.randomUUID()}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should return 200 and remove the message", async () => {
    const res = await supertest(app).delete(url).set("Cookie", cookie);

    expect(res.status).toBe(200);

    const resDetails = await supertest(app).delete(url).set("Cookie", cookie);

    expect(resDetails.status).toBe(404);
  });
});
