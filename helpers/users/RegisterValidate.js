const validator = require('validator'); 

const registerValidate = (params) => {
    let nameValidate = !validator.isEmpty(params.name); 
    let nickNameValidate = !validator.isEmpty(params.nickName); 
    let emailValidate = !validator.isEmpty(params.email) && validator.isEmail(params.email); 
    let passwordValidate = validator.isLength(params.password,{min: 5}); 
    
    if( !nameValidate ||
        !nickNameValidate ||
        !emailValidate ||
        !passwordValidate){
            throw new Error('Los datos no son correctos'); 
        }
}

module.exports = {
    registerValidate
}