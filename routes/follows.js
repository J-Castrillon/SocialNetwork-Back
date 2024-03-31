const express = require("express");
const routerFollow = express.Router();
const {authentication} = require('../auth/middlewares/authMiddleware'); 
const { save } = require("../controllers/follows");

// Private routes;
routerFollow.get("/save", authentication, save);

// Public routes;

module.exports = {
  routerFollow,
};
