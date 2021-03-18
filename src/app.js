require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const { NODE_ENV } = require("./config");
const { default: knex } = require("knex");

const articlesRouter = require("./articles-router");
const usersRouter = require("./users/users-router");

const app = express();
const morganOption = NODE_ENV === "production";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);

//GET root page, send back 'Hello, world!' on web page
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//XSS Example
// app.get("/xss", (req, res) => {
//   res.cookie("secretToken", "1234567890");
//   res.sendFile(__dirname + "/xss-example.html");
// });

//Hide error message from users and outsiders
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }

  res.status(500).json(response);
});

module.exports = app;
