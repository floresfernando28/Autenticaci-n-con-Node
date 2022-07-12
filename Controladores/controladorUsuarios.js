const jwt = require('jsonwebtoken'); //Authenticated user
const bcryptjs = require('bcryptjs'); //Encriptar contraseñas
const conexion = require('../Databases/database');
const {promisify} = require('util');

// Controlador para registrar usuarios al sistema 
exports.registracion = async (req, res)=>{

    let userPas = false;
    let userName;

    try{
        let usuarios = ({
            usuario: req.body.usuario,
            nombre: req.body.nombre,
            password: req.body.pass
        })
            
        if(!(usuarios.usuario) || !(usuarios.nombre) || !(usuarios.password)){
            res.render('registrarse',{
                alerta: true,
                alertaTitulo: 'Advertencia',
                alertaTexto: 'Por favor Asegurese de ingresar datos para poder acceder',
                alertaIcon: 'info',
                alertaShowConfirmButton: true,
                alertaTimer: '',
                ruta: 'registrarse'
            })
        }else{
            conexion.query('SELECT * FROM usuario', async (error, results)=>{
                if(error){
                    console.log('Error al hacer la insercion de los datos ala base de datos\n'+error);
                    return
                }
                results.forEach((datos)=>{
                    if(usuarios.usuario == datos.usuario){
                        userPas = true;
                        userName = datos.usuario;
                    }
                });

                if(userPas){
                    res.render('registrarse',{
                        alerta: true,
                        alertaTitulo: `El usuario ${userName} ya existe `,
                        alertaTexto: 'Ingrese otro nombre de usuario diferente',
                        alertaIcon: 'info',
                        alertaShowConfirmButton: true,
                        alertaTimer: '',
                        ruta: 'registrarse'
                    })
                }else{
                    const passHash = await bcryptjs.hash(usuarios.password,8);
                    let consulta = 'INSERT INTO usuario SET ?';
                    conexion.query(consulta, {usuario:usuarios.usuario, nombre: usuarios.nombre, pass:passHash}, (error, results)=>{
                        if(error){
                            console.log('Error al hacer la insercion de los datos ala base de datos\n'+error);
                            return
                        }
        
                        console.log('\n¡Usuario Registrado Correctamente!');
                        console.log(usuarios.usuario+'\n'+usuarios.nombre+'\n'+passHash)
                        return res.render('registrarse',{
                            alerta: true,
                            alertaTitulo: '¡Usuario Registrado Correctamente!',
                            alertaTexto: 'Usuario Registrado correctamente en el sistema!!',
                            alertaIcon: 'success',
                            alertaShowConfirmButton: true,
                            alertaTimer: '',
                            ruta: ''
                        })
                    })
                }

                
            })
        }


    }catch(error){
        console.log('Ha sucedido un error al registrar usuarios:\n'+error);
    }

}

// Controlador para loguearse el usuario con la registración ya echa
exports.loguearse = async (req, res)=>{
    const datos_logueo = ({
        usuario: req.body.usuario,
        password: req.body.pass
    })

    if(!(datos_logueo.usuario) || !(datos_logueo.password)){
        res.render('login', {
            alerta: true,
            alertaTitulo: 'Advertencia',
            alertaTexto: 'Ingrese datos en los campos vacios por favor!',
            alertaIcon: 'info',
            alertaShowConfirmButton: true,
            alertaTimer: '',
            ruta: ''
        });
    }else{
        conexion.query('SELECT * FROM usuario WHERE usuario = ?',[datos_logueo.usuario], async (error, results)=>{
            if(error){
                console.log('Error al hacer la petición al loguearse '+error);
                return
            }

            if((results.length == 0) || !(await bcryptjs.compare(datos_logueo.password, results[0].pass))){
                res.render('login',{
                    alerta: true,
                    alertaTitulo: 'Usuario Incorrecto',
                    alertaTexto: 'El usuario No existe en el sistema',
                    alertaIcon: 'error',
                    alertaShowConfirmButton: true,
                    alertaTimer: '',
                    ruta: ''
                });
            }else{

                const id = results[0].id
                console.log('\nEl id del usuario con el token es: '+id)
                const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                    expiresIn: process.env.JWT_EXPIRACION
                })
                const opcionesCookies = ({
                    expires: new Date(Date.now()+process.env.COOKIE_EXPIRACION * 24 * 60 * 60 * 100),
                    httpOnly:true
                })
                res.cookie('jwt',token, opcionesCookies);
                res.render('login',{
                    alerta: true,
                    alertaTitulo: '¡Ingreso Correctamente al sistema '+results[0].usuario+'!',
                    alertaTexto: 'Ha accedido al sistema con exito!',
                    alertaIcon: 'success',
                    alertaShowConfirmButton:'',
                    alertaTimer: '800',
                    ruta: ''
                })
                console.log('\n¡El usuario logueado es!\n')
                console.log(results)

            }
        })
    }
}

// Controlador para hacer (isAuthenticated) del usuario
exports.isAutehnticated = async (req, res, next)=>{
    if(req.cookies.jwt){
        try{
            const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM usuario WHERE id = ?', [decodificado.id], (error, results)=>{
                if(error){
                    console.log(error)
                    return 
                }
                console.log('El Usuario Logueado es: ----------> '+results[0].usuario)
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        }catch(error){
            console.log('Ha ocurrido un error en el controlador isAutehnticated '+error)
            return next()
        }
    }else{
        res.redirect('/login')
    }
}

// Controlador para desloguear 
exports.desLoguearse = (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')
}

// Controlador para borrar el cache del navegador
exports.nocahe = (req, res,next)=>{
    res.header('Cache-Control','private, no-cache, no-store, must-revalidate')
    next()
}

// exports.datosUsuarios = (req, res)=>{
//     try{



//     }catch(error){
//         throw error;
//     }
// }