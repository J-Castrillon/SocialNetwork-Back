const express = require("express");
const routerPublication = express.Router();
const multer = require("multer");
const { authentication } = require("../auth/middlewares/authMiddleware");
const {
  save,
  detail,
  remove,
  userPublications,
  uploads,
  showFile,
  feed,
} = require("../controllers/publications");

// Rutas privadas;
routerPublication.post("/save", authentication, save);
routerPublication.get("/detail/:id", authentication, detail);
routerPublication.delete("/remove/:id", authentication, remove);
routerPublication.get("/all/:id/:page?", authentication, userPublications);

// Archivos;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/publications");
  },
  filename: function (req, file, cb) {
    cb(null, `publication-${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
routerPublication.put(
  "/upload/:id",
  [authentication, upload.single("file0")],
  uploads
);
routerPublication.get("/viewFile/:id", authentication, showFile);
routerPublication.get('/feed/', authentication, feed); 

// Rutas publicas;

module.exports = {
  routerPublication,
};
