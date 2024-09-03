import dotenv from "dotenv";

dotenv.config();

const api = require("./api");
const port = process.env.PORT || 3000;

// Start the server
api.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
