const {Schema, model} = require('mongoose'); 

const followSchema = Schema({
    user: {
        type: Schema.ObjectId, // Referencia a otro objeto (como las foreign key); 
        ref: "User", 
    }, 
    followed: {
        type: Schema.ObjectId, 
        ref: "User"
    }, 
    created_at: {
        type: Date, 
        default: Date.now, 
    }
}); 

module.exports = model('Follow', followSchema); 