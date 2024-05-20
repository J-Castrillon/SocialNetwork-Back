const express = require("express");
const routerFollow = express.Router();
const {authentication} = require('../auth/middlewares/authMiddleware'); 
const { save, unfollow, followers } = require("../controllers/follows");

// Private routes;
routerFollow.post("/save", authentication, save);
routerFollow.delete("/unfollow/:id", authentication, unfollow );

// Public routes;
routerFollow.get('/followers/:id/:page?', followers)

module.exports = {
  routerFollow,
};
