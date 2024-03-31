// Modules;
const jwt = require("jwt-simple");
const moment = require("moment");
const { jwtCostant } = require("../constants/jwtConstants");

// Authentication;
const authentication = async (req, res, next) => {
  // Headers;
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "Error",
      message: "Error de autenticacion",
    });
  }

  // Limpiar el token;
  const token = await req.headers.authorization.replace(/['"]+/g, "");

  try {
    // Decodificar el token;
    const payload = await jwt.decode(token, jwtCostant.secret);
    // Validar la expiracion del token;
    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "Error",
        message: "No Autorizado",
      });
    }

    // Agregar los datos del usuario a la request;
    req.user = payload;
    // Pasar a ejecucion de accion - Para el controlador;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "Error",
      message: "Token invalido",
    });
  }
};

module.exports = {
  authentication,
};
