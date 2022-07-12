// Importamos Mysql para poder configurar su conexion

const Mysql = require('mysql');


const conexion = Mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

conexion.connect((error)=>{
    if(error){
        console.log('Ha habido en error al conectar con la Base de datos '+process.env.DB_NAME)
        return
    }  
    console.log('La conexión Ha Sido Exitosa ala Base de Datos ' +process.env.DB_NAME);
})

module.exports = conexion;
