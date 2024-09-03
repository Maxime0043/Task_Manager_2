import dotenv from "dotenv";

dotenv.config();

// Import the database
import db from "./db/models";

// Import the API;
import api from "./api";

db.sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully [" +
        process.env.ENV_TYPE +
        "]."
    );

    const port = process.env.PORT || 3000;

    // Start the server
    api.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Unable to connect to the database:", error);
  });
