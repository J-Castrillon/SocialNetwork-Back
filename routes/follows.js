const express = require("express");
const routerFollow = express.Router();
const {authentication} = require('../auth/middlewares/authMiddleware'); 
const { save, unfollow, followers } = require("../controllers/follows");

// Private routes;
routerFollow.get("/save", authentication, save);
routerFollow.delete("/unfollow/:id", authentication, unfollow );
routerFollow.get('/followers/:id/:page?', authentication, followers)

// Public routes;

module.exports = {
  routerFollow,
};
