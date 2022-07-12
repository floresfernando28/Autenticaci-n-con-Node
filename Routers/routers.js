const express = require('express');
const router = express();
const conexion = require('../Databases/database');
const controladorUsuario = require('../Controladores/controladorUsuarios');


router.get('/',controladorUsuario.isAutehnticated, controladorUsuario.nocahe, (req, res)=>{
    res.render('index',{user:req.user})
})
router.get('/login',(req, res)=>{
    res.render('login',{alerta:false});
})

router.get('/registrarse', (req, res)=>{
    res.render('registrarse',{alerta:false});
})

// Rutas para los métodos del CRUD - Llamamos al método
router.post('/registracion', controladorUsuario.registracion);
router.post('/loguearse', controladorUsuario.loguearse);
router.get('/desloguearse',controladorUsuario.desLoguearse);


module.exports = router;
