const Follow = require("../models/follow");
const User = require("../models/users");
const Paginate = require("mongoose-pagination");

// Accion de seguir;
const save = async (req, res) => {
  // Conseguir los datos por el body;
  const params = req.body;

  // IdUser;
  const user = await User.findOne({ email: req.user.email });
  const idUser = user._id;

  // Crear objeto con el modelo;
  const userToFollow = new Follow();
  userToFollow.user = idUser;
  userToFollow.followed = params.followed;

  // Almacenar el objeto;
  const send = await userToFollow.save();

  if (send) {
    return res.status(200).json({
      status: "Success",
      message: "Estamos en el save de los follows",
      params,
      send,
    });
  } else {
    return res.status(200).json({
      status: "500",
      message: "Ocurrio un error al intentar seguir el usuario",
    });
  }
};

// Accion de dejar de seguir;
const unfollow = async (req, res) => {
  // Usuario autorizado;
  const authorized = await User.findOne({ email: req.user.email });

  // Id usuario a dejar de seguir y encontrarlo en los seguidos;
  const followed = await Follow.findOne({
    user: authorized._id,
    followed: req.params.id,
  });
  const userFollowed = await User.findOne({ _id: req.params.id });

  // Dejar de seguir;
  if (!followed) {
    return res.status(404).json({
      status: "Error",
      message: "Usuario no existente",
    });
  }

  const unfollowed = await Follow.deleteOne(followed._id);

  if (!unfollowed) {
    return res.status(500).json({
      status: "Error",
      message: "No fue posible dejar de seguir el usuario",
    });
  }

  return res.status(200).json({
    status: "Success",
    message: `Dejaste de seguir a ${userFollowed.name}`,
  });
};

// Accion de listado de seguidores;
const followers = async (req, res) => {
  // Id del usuario identificado;
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return res.status(404).json({
      status: "Error",
      message: "El usuario no existe",
    });
  }

  // Paginación;
  let page = 1;
  const itemsPage = 5;
  if (req.params.page) page = req.params.page;

  const totalFollowing = await Follow.find({user: user._id});
  const following = await Follow.find({ user: user._id })
    .sort("_id")
    .populate("user followed", "-_id -password -role -__v -email") // El populate sirve para hacer como un join con la tabla y mostrar los datos de ese documento;
    .paginate(page, itemsPage);

  const totalFollowers = await Follow.find({ followed: user._id }); 
  const followers = await Follow.find({ followed: user._id })
    .sort("_id")
    .populate("user followed", "-_id -password -role -__v -email") // El populate sirve para hacer como un join con la tabla y mostrar los datos de ese documento;
    .paginate(page, itemsPage);

  // Devolver los datos;
  return res.status(200).json({
    status: "Success",
    message: "Lista de seguidos",
    totalFollowers: totalFollowers.length,
    totalFollowings: totalFollowing.length,
    pages: Math.ceil(totalFollowing.length / itemsPage),
    followers,
    following,
  });
};

module.exports = {
  save,
  unfollow,
  followers,
};
