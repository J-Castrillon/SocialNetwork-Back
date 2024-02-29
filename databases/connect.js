const mongoose = require("mongoose");

const connection = async()=>{
    try{
        const mydb = 'redSocial'; 
        await mongoose.connect(`mongodb://localhost:27017/${mydb}`);

        console.log("Connected"); 
    }catch(error){
        console.log(error); 
    }
    
}

module.exports = {
    connection
}