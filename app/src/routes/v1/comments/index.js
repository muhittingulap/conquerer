const express = require("express");
const comments = express.Router();
const commentController = require("../../../controllers/v1/commentController");
/*
Middlewares
*/
const auth = require("../../../middlewares/auth");

// auth
comments.get("/", auth, commentController.lists);
comments.delete("/:id", auth, commentController.del);

module.exports = comments;