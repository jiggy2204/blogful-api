require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const { NODE_ENV } = require("./config");
const ArticlesService = require("./articles-service");
const { default: knex } = require("knex");
const app = express();
const morganOption = NODE_ENV === "production";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/articles", (req, res, next) => {
  const knexInstance = req.app.get("db");

  ArticlesService.getAllArticles(knexInstance)
    .then((articles) => {
      res.json(articles);
    })
    .catch(next);
});

app.get("/articles/:article_id", (req, res, next) => {
  ArticlesService.getById(req.app.get("db"), req.params.article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).json({
          error: { message: "Article doesn't exist" },
        });
      }
    })
    .then((articles) => {
      res.json({
        id: articles.id,
        title: articles.title,
        style: articles.style,
        content: articles.content,
        date_published: new Date(articles.date_published),
      });
    })
    .catch(next);
});

//GET root page, send back 'Hello, world!' on web page
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

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
