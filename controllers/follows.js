const Follow = require('../models/follow'); 
const User = require('../models/users'); 

// Accion de seguir; 
const save = async (req, res) => {
    // Conseguir los datos por el body; 
    const params = req.body; 

    // IdUser; 
    const user = await User.findOne({email: req.user.email});
    console.log(user) 
    const idUser = user._id; 

    // Crear objeto con el modelo;
    const userToFollow = new Follow(); 
    userToFollow.user = idUser; 
    userToFollow.followed = params.followed; 

    console.log(userToFollow)

    // Almacenar el objeto; 
    const send = await userToFollow.save();

    if(send){
        return res.status(200).json({
            status: "Success", 
            message: "Estamos en el save de los follows",
            params, 
            send,
        })
    }else{
        return res.status(200).json({
            status: "Error", 
            message: "Ocurrio un error al intentar seguir el usuario",
        })
    }
}

// Accion de dejar de seguir; 

// Accion de listado de seguidos; 

// Accion de listado de seguidores; 

module.exports = {
    save
}