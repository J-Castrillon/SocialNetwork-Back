const express = require("express");
const routerUser = express.Router();

// Routes Imports;
const { prueba } = require("../controllers/users");

routerUser.get("/userProff", prueba);

module.exports = { routerUser };
