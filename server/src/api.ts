import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

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
// ...

// Export the express app
module.exports = app;
