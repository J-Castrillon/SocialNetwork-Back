// Acciones de prueba; 
const prueba = (req,res)=>{
    return res.status(200).send({message: 'Estamos desde el controlador del usuario'})
}

module.exports = {
    prueba
}