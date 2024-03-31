// Depencias; 
const jwt = require('jwt-simple'); 
const moment = require('moment'); 
const {jwtCostant} = require('./constants/jwtConstants'); 

// Generar el token; 
const generateToken = async (user) => {
    const payload = {
        name: user.name, 
        lastName: user.lastName, 
        nickName: user.nickName, 
        email: user.email, 
        role: user.role, 
        iat: moment().unix(), 
        exp: moment().add(30,'days').unix(),
    }

    // Devolver el token; 
    return await jwt.encode(payload, jwtCostant.secret);
}

module.exports = {
    generateToken, 
}