const express = require("express");
const users = express.Router();
const userController = require("./../../../controllers/v1/userController");
/*
Middlewares
*/
const auth = require("../../../middlewares/auth");
const { error } = require("../../../middlewares/error");

/*
Validators
*/
const {
    loginValidator,
    registerValidator,
    updateValidator
} = require("../../../validators/users");


// no auth
users.get("/stats", userController.stats);

users.post("/login", loginValidator, error, userController.login);
users.post("/register", registerValidator, error, userController.register);

// auth
users.put("/", auth,updateValidator, error, userController.update);
users.delete("/", auth, userController.del);

module.exports = users;