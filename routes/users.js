const express = require("express");
const routerUser = express.Router();
const {authentication} = require('../auth/middlewares/authMiddleware'); 
const multer = require('multer'); 

// Routes Imports; 
const { prueba, register, login, profile,  listUsers, update, uploads, showAvatar} = require("../controllers/users");

// Private routes; 
routerUser.get("/userProff", authentication, prueba); // Aplicando el middleware;
routerUser.get("/profile/:id", authentication, profile); 
routerUser.get("/allUsers/:page?", authentication, listUsers); 
routerUser.put("/update/:id", authentication, update); 

// Subida de archivos;
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "./uploads/avatars");
    }, 
    filename: function(req,file,cb){
        cb(null, `avatar-${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({storage}); 
routerUser.post("/uploads/:id", [authentication, upload.single("file0")], uploads); 

routerUser.get("/avatar/:fichero", showAvatar); 

// Public routes; 
routerUser.post("/register", register);
routerUser.post("/login", login);

module.exports = { routerUser };
