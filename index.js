// BD connect; 
const {connection} = require('./databases/connect');
connection(); 

// Servidor node;
const express = require('express'); 
const app = express(); 
const port = 3900; 

// CorsConfig; 
const cors = require('cors'); 
app.use(cors()); 

// JSONConvert;
app.use(express.json()); 
app.use(express.urlencoded({extended: true})); 

// Routes;
app.get('/welcome',(req,res)=>{
    console.log('Hello world from NodeJS'); 
}); 

    // General; 
const {routerUser} = require('./routes/users'); 
const {routerPublication} = require('./routes/publications'); 
const {routerFollow} = require('./routes/follows'); 

app.use('/api/v1',routerUser); 
app.use('/api/v1',routerPublication); 
app.use('/api/v1',routerFollow); 


// Listen;
app.listen(port,()=>{
    console.log('API Started'); 
}); 