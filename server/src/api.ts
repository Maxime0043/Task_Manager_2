import dotenv from "dotenv";

dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import "express-async-errors";
import session, { Store } from "express-session";
import connectMysql from "connect-session-sequelize";

import db from "./db/models";

// Define the express app
const app = express();

// Define the session store
const SequelizeStore = connectMysql(Store);
const store = new SequelizeStore({
  db: db.sequelize,
  checkExpirationInterval: 1000 * 60 * 15, // 15 minutes
  expiration: 1000 * 60 * 60, // 1 hour
  table: "Session",
});

// Define the session data
declare module "express-session" {
  interface Session {
    token: string;
  }
}

// Define Helmet
app.use(helmet());
// Define CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Define the session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      secure: false,
    },
  })
);
// Define JSON as the default content type
app.use(express.json());

// Define the API routes
import routes from "./routes";

app.use("/api/v1", routes);

// Error Handler
import { errorHandler } from "./middlewares/errors.middleware";

app.use(errorHandler);

// Export the express app
export default app;
