import dotenv from "dotenv";

dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();

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
// Define JSON as the default content type
app.use(express.json());

// Define the API routes
import routes from "./routes";

app.use("/api/v1", routes);

// Export the express app
export default app;
