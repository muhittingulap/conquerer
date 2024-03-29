const express = require("express");

const users = require("./users/index");
const blogs = require("./blogs/index");
const categories = require("./categories/index");
const comments = require("./comments/index");

const v1 = express.Router();

v1.use("/users", users);
v1.use("/blogs", blogs);
v1.use("/categories", categories);
v1.use("/comments", comments);

module.exports = v1;