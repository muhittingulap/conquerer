const express = require("express");
const blogs = express.Router();
const blogController = require("../../../controllers/v1/blogController");
/*
Middlewares
*/
const auth = require("../../../middlewares/auth");
const { error } = require("../../../middlewares/error");

/*
Validators
*/
const {
    createValidator,
    updateValidator
} = require("../../../validators/blogs");

// auth
blogs.get("/", auth, blogController.lists);
blogs.post("/", createValidator, error, auth, blogController.create);
blogs.put("/:id", updateValidator, error, auth, blogController.update);
blogs.delete("/:id", auth, blogController.del);

module.exports = blogs;