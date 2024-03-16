const express = require("express");
const routerUser = express.Router();

// Routes Imports;
const { prueba, register,login } = require("../controllers/users");

routerUser.get("/userProff", prueba);
routerUser.post("/register", register);
routerUser.post("/login", login); 

module.exports = { routerUser };
