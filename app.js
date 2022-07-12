// Importamos el expres 
const express = require('express')
const app = express(); 
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser');

app.use(express.static('public'))
dotenv.config({path: './env/.env'})


// Añadimos el motor de plantillas ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser());
app.use('/', require('./Routers/routers'))

// Configuramos el puerto 
app.listen(3000, (req, res)=>{
    console.log('Mensaje desde el puerto http://localhost:3000')
})




