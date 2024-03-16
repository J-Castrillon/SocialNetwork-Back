const validator = require('validator'); 

const loginValidate = (params) => {
    let emailValidator = !validator.isEmpty(params.email) || !validator.isEmail(params.email); 
    let passwordValidator = !validator.isEmpty(params.password); 

    if(!emailValidator || !passwordValidator){
        throw new Error('Faltan datos'); 
    }
}

module.exports = {loginValidate}