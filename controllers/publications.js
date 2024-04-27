const Publication = require("../models/publication");
const User = require("../models/users");
const Follow = require("../models/follow"); 
const Paginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Guardar publicacion;
const save = async (req, res) => {
  // Usuario identificado;
  const authUser = (await User.findOne({ email: req.user.email })) || null;

  // Parametros;
  const params = req.body;

  if (!params.text) {
    return res.status(400).json({
      status: "Error",
      message: "Sin datos para crear publicación",
    });
  }

  const newPublication = new Publication(params);
  newPublication.user = authUser._id;

  const send = await newPublication.save();

  if (!send) {
    return res.status(400).json({
      status: "Error",
      message: "No fue posible publicar el artículo",
    });
  }

  return res.status(200).json({
    status: "Success",
    message: "Estamos en las publicaciones",
    newPublication,
  });
};

// Sacar una publicacion en concreto;
const detail = async (req, res) => {
  // id de la publicacion;
  const idPublication = req.params.id;

  // Encontrar la publicacion;
  const publication = await Publication.findOne({ _id: idPublication });

  if (!publication) {
    return res.status(404).json({
      status: "Error",
      message: "Publicacion no existente",
    });
  }

  // Devolver una respuesta;
  return res.status(200).json({
    status: "Success",
    publication,
  });
};

// Eliminar publicaciones;
const remove = async (req, res) => {
  // Usuario identificado;
  const authUser = await User.findOne({ email: req.user.email });

  // idPublication;
  const idPublication = req.params.id;

  // Eliminar la publicacion si es del usuario identificado;
  const publication = await Publication.findOne({
    _id: idPublication,
    user: authUser._id,
  });

  if (!publication) {
    return res.status(404).json({
      status: "Error",
      message: "Ocurrio un error con el articulo",
    });
  }

  const removed = await Publication.findOneAndDelete(idPublication);

  if (!removed) {
    return res.status(400).json({
      status: "Error",
      message: "No fue posible eliminar el articulo",
    });
  }

  return res.status(200).json({
    status: "Success",
    message: "Publicación eliminada exitosamente",
    publication,
  });
};

// Listar publicaciones de un usuario en su perfil;
const userPublications = async (req, res) => {
  // Sacar el id del usuario;
  const authUser = await User.findOne({ _id: req.params.id });
  console.log(authUser);

  // Control de paginacion;
  let page = 1;
  const itemsPage = 5;
  if (req.params.page) page = req.params.page;

  // Ordenar y enviar;
  const total = await Publication.find({ user: authUser._id });
  const publications = await Publication.find({ user: authUser._id })
    .sort({ created_at: -1 })
    .populate("user", "-password -__v -email")
    .paginate(page, itemsPage);

  if (!publications || total.length === 0) {
    return res.status(404).json({
      status: "Error",
      user: "Sin publicaciones",
    });
  }

  return res.status(200).json({
    status: "Success",
    totalArticles: total.length,
    page,
    totalPages: Math.ceil(total.length / itemsPage),
    publications,
  });
};

// Subir ficheros;
const uploads = async (req, res) => {
  // Usuario identificado;
  const authUser = await User.findOne({ email: req.user.email });

  // Validacion del archivo;
  if (!req.file) {
    return res.status(404).json({
      status: "Error",
      message: "No hay archivos para almacenar",
    });
  }

  // Datos del archivo;
  const file = req.file.filename;

  // Comprobar la extencion;
  const ext = file.split(".")[1];
  if (ext !== "jpg" && ext !== "png" && ext !== "gif" && ext !== "jpeg") {
    // Borrar archivo;
    fs.unlink(req.file.path, () => {
      return res.status(400).json({
        status: "Error",
        message: "Imagen invalida",
      });
    });
  } else {
    // Almacenar la ruta;
    const sendFile = await Publication.findOneAndUpdate(
      { user: authUser._id, _id: req.params.id },
      { file },
      { new: true }
    );

    if (!sendFile) {
      return res.status(500).json({
        status: "Error",
        message: "No fue posible almacenar el archivo",
      });
    }

    return res.status(500).json({
      status: "Success",
      message: `Archivo ${req.file.originalname} almacenado correctamente`,
      sendFile,
    });
  }
};

const showFile = async (req, res) => {
  // Id Publication;
  const publication = await Publication.findOne({ _id: req.params.id });
  const fichero = publication.file;

  // Completar la ruta;
  const realPath = `./uploads/publications/${fichero}`;

  // Validar la existencia del archivo;
  fs.stat(realPath, (error, exist) => {
    if (exist) {
      return res.sendFile(path.resolve(realPath));
    } else {
      return res.status(404).json({
        status: "Error",
        message: "No existe el archivo",
      });
    }
  });
};

// Listar todas las publicaciones de los usuarios que sigo;
const feed = async (req, res) => {
  // Tener en cuenta los followings; 
  const authUser = await User.findOne({email: req.user.email}); 

  // Hayar los que sigo;
  const following = await Follow.find({ user: authUser._id }); 
  const followingIds = following.map(follow => follow.followed); 

  // Publicaciones que contengan a los que sigo; 
  const totalPublications = await Publication.find({ user: followingIds }); 
  const publications = await Publication.find({ user: followingIds })
  .sort("-created_at")
  .populate("user", "-password -__v -_id -email");

  if(!publications){
    return res.status(404).json({
      status: "Error",
      message: "No fue posible encontrar publicaciones",
      followingIds,
      following, 
      publications,
    });
  }

  return res.status(200).json({
    status: "Success",
    message: "Feed actualizado",
    totalPublications,
    following, 
    publications,
  });
};

// Devolver archivos multimedia;

module.exports = {
  save,
  detail,
  remove,
  userPublications,
  uploads,
  showFile,
  feed,
};
