// Resources and models;
const bcrypt = require("bcrypt");
const User = require("../models/users");
const { registerValidate } = require("../helpers/users/RegisterValidate");
const { loginValidate } = require("../helpers/login/loginValidate");

const prueba = (req, res) => {
  return res
    .status(200)
    .send({ message: "Estamos desde el controlador del usuario" });
};

const register = async (req, res) => {
  // Recoger todos los datos de la peticion;
  const params = req.body;

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
    params.password = bcrypt.hash(params.password, 10);

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
  const token = false;

  // Devolver los Datos del usuario;
  return res.status(200).json({
    status: "Success",
    user: {
        id: exist._id, 
        name: exist.name, 
        nickName: exist.nickName, 
        role: exist.role,
    },
    userToken: token,
  });
};

module.exports = {
  prueba,
  register,
  login,
};
