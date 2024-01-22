const express = require("express");
const categories = express.Router();
const categoryController = require("../../../controllers/v1/categoryController");


// no auth
categories.get("/rates", categoryController.rates);

// auth
categories.get("/", categoryController.lists);

module.exports = categories;