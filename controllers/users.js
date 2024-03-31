// Resources and models;
const bcrypt = require("bcrypt");
const User = require("../models/users");
const { registerValidate } = require("../helpers/users/RegisterValidate");
const { loginValidate } = require("../helpers/login/loginValidate");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Services;
const { generateToken } = require("../auth/authGuard");

const prueba = (req, res) => {
  return res.status(200).send({ user: req.user });
};

const register = async (req, res) => {
  // Recoger todos los datos de la peticion;
  const params = req.body;
  console.log(params);

  // Validacion de datos - funcion validadora;
  try {
    registerValidate(params);
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Los datos no son correctos",
    });
  }

  // Control de usuarios duplicados;
  const query = await User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nickName: params.nickName.toLowerCase() },
    ],
  }).exec();

  if (!query) {
    return res.status(500).json({
      status: "Error",
      message: "Ocurrió un error en la consulta de validación",
    });
  } else if (query && query.length >= 1) {
    return res.status(200).json({
      status: "Success",
      message: "El usuario ya está registrado",
    });
  } else {
    // Cifrar el password;
    params.password = await bcrypt.hash(params.password, 10);

    // Crear objeto de usuario;
    const newUser = new User(params);

    // Almacenar en la base de datos;
    const stored = await newUser.save();

    // Devolver una respuesta;
    if (!stored) {
      return res.status(500).json({
        status: "Error",
        message: "Ocurrió un error en la creación del usuario",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Usuario creado exitosamente",
      newUser,
    });
  }
};

const login = async (req, res) => {
  // Parametros;
  const params = req.body;

  // Validacion de datos;
  try {
    loginValidate(params);
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en los datos ingresados",
    });
  }

  // Usuario existente;
  const exist = await User.findOne({ email: params.email }).exec();

  if (!exist) {
    return res.status(400).json({
      status: "Error",
      message: "Contraseña o email incorrecto",
    });
  }

  // Comprobar el password;
  const compare = bcrypt.compareSync(params.password, exist.password);

  if (!compare) {
    return res.status(400).json({
      status: "Error",
      message: "Contraseña o email incorrecto",
    });
  }

  // Token;
  const token = await generateToken(exist);

  // Devolver los Datos del usuario;
  return res.status(200).json({
    status: "Success",
    user: {
      id: exist._id,
      name: exist.name,
      nickName: exist.nickName,
      role: exist.role,
    },
    token,
  });
};

const profile = async (req, res) => {
  // Recibir el parametro del id de usuario por la url;
  const idUser = req.params.id;

  // Obtener los datos del usuario;
  const userProfile = await User.findById(idUser)
    .select({ password: 0, __v: 0 }) // Menos estos datos;
    .exec();

  if (!userProfile) {
    return res.status(404).json({
      status: "Error",
      message: "Usuario no econtrado",
    });
  }

  // Devolver el resultado;
  return res.status(200).json({
    status: "Success",
    userProfile,
  });
};

const listUsers = async (req, res) => {
  // Pagina en la que estamos situados;
  const page = req.params.page ? parseInt(req.params.page) : 1;
  const itemsPage = 5;

  // consulta para mongoose pagination;
  const total = await User.find();
  const list = await User.find().sort("_id").paginate(page, itemsPage);

  // Devolver el resultado;
  if (!list) {
    return res.status(404).json({
      status: "Error",
      message: "No existen usuarios disponibles",
    });
  }

  return res.status(200).json({
    status: "Success",
    page,
    results: total.length,
    pages: Math.ceil(total.length / itemsPage),
    itemsPage,
    list,
  });
};

const update = async (req, res) => {
  // Informacion del usuario a actualizar;
  const userId = req.params.id;
  const userUpdate = req.body;

  // Eliminar campos no necesarios;
  delete userUpdate.iat;
  delete userUpdate.exp;
  delete userUpdate.role;
  delete userUpdate.image;

  // Validar el usuario;
  const query = await User.find({
    $or: [
      { email: userUpdate.email.toLowerCase() },
      { nickName: userUpdate.nickName.toLowerCase() },
    ],
  }).exec();

  if (!query) {
    return res.status(500).json({
      status: "Error",
      message: "Ocurrió un error en la consulta de validación",
    });
  }

  // Cifrar el password;
  if (userUpdate.password) {
    userUpdate.password = await bcrypt.hash(userUpdate.password, 10);
  }

  // Actualizar;
  try {
    const send = await User.findOneAndUpdate({ _id: userId }, userUpdate, {
      new: true,
    });

    return res.status(200).json({
      status: "Success",
      message: "Estamos en el update",
      send,
    });
  } catch (error) {
    if (!send) {
      return res.status(404).json({
        status: "Error",
        message:
          "Ocurrio un error al actualizar la informacion en la base de datos",
      });
    }
  }
};

const uploads = async (req, res) => {
  const idUser = req.params.id;

  // Validacion de Imagen;
  if (!req.file) {
    return res.status(404).json({
      status: "Error",
      message: "No se envio ningun archivo",
    });
  }

  // Datos del archivo;
  const file = req.file.filename;

  // Comprobar la extencion;
  const ext = req.file.filename.split(".")[1];

  // Borrar el archivo de la carpeta;
  if (ext !== "png" && ext !== "jpg" && ext !== "jpeg" && ext !== "gif") {
    // Borrar archivo;
    fs.unlink(req.file.path, () => {
      return res.status(400).json({
        status: "Error",
        message: "Imagen invalida",
      });
    });
  } else {
    // Almacenar la ruta;
    const sendUpdate = await User.findOneAndUpdate(
      { _id: idUser },
      { image: file }
    );

    if (!sendUpdate) {
      return res.status(500).json({
        status: "Error",
        message: "Error en la carga del archivo",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Imagen cargada correctamente",
    });
  }
};

const showAvatar = async (req, res) => {
  // Obtener el parametro;
  const fichero = req.params.fichero;

  // Crear el path;
  const filePath = `./uploads/avatars/${fichero}`;

  // Validar la existencia del archivo;
  fs.stat(filePath, (error, exist) => {
    // Devolver el archivo;
    if (exist) {
      return res.sendFile(path.resolve(filePath));
    } else {
      return res.status(404).json({
        status: "Error",
        message: "No existe el archivo",
      });
    }
  });
};

module.exports = {
  prueba,
  register,
  login,
  profile,
  listUsers,
  update,
  uploads,
  showAvatar,
};
