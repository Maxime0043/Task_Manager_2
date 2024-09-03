require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.MYSQL_DEV_HOST,
    port: process.env.MYSQL_DEV_PORT,
    username: process.env.MYSQL_DEV_USER,
    password: process.env.MYSQL_DEV_PASSWORD,
    database: process.env.MYSQL_DEV_DATABASE,
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: true,
    },
  },
  test: {
    dialect: "mysql",
    host: process.env.MYSQL_TEST_HOST,
    port: process.env.MYSQL_TEST_PORT,
    username: process.env.MYSQL_TEST_USER,
    password: process.env.MYSQL_TEST_PASSWORD,
    database: process.env.MYSQL_TEST_DATABASE,
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: true,
    },
  },
  production: {
    dialect: "mysql",
    host: process.env.MYSQL_PROD_HOST,
    port: process.env.MYSQL_PROD_PORT,
    username: process.env.MYSQL_PROD_USER,
    password: process.env.MYSQL_PROD_PASSWORD,
    database: process.env.MYSQL_PROD_DATABASE,
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: true,
    },
  },
};
