const express = require("express");
const users = express.Router();

const userController = require("./../../../controllers/v1/userController");

users.get("/me", userController.me);

module.exports = users;