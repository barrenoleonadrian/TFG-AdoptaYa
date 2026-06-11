// Capa de lógica de negocio para usuarios.
// Aquí van las reglas: validar tipos, hashear contraseñas, generar JWT,
// comprobar duplicados... Esta capa NO sabe nada de Express ni de SQL.
// Recibe datos del controller, habla con el repository, y devuelve el resultado.
//
// Los errores se lanzan con las clases personalizadas de utils/errors.js.
// El controller los pasará al errorHandler central con next(err).

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const usuariosRepo = require('../repositories/usuariosRepository')
const config = require('../config')

const {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError
} = require('../utils/errors')


// genera el token JWT con el id y tipo del usuario
function generarToken(id, tipo){
    return jwt.sign(
        { id, tipo },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    )
}


// LOGIN
// devuelve { token, usuario } o lanza error si las credenciales no son válidas
async function login(email, password){

    const usuario = await usuariosRepo.buscarPorEmail(email)

    // mensaje genérico si el email no existe (no decimos qué falló por seguridad)
    if(!usuario){
        throw new UnauthorizedError('Email o contraseña incorrectos')
    }

    // bcrypt es lento a propósito para dificultar fuerza bruta
    const valido = bcrypt.compareSync(password, usuario.password)

    if(!valido){
        throw new UnauthorizedError('Email o contraseña incorrectos')
    }

    // los refugios sin verificar no pueden entrar hasta que el admin los apruebe
    if(usuario.tipo === 'protectora' && !usuario.verificado){
        throw new ForbiddenError('Tu cuenta está pendiente de verificación. Te avisaremos cuando el administrador la apruebe.')
    }

    return {
        token: generarToken(usuario.id, usuario.tipo),
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipo: usuario.tipo,
            verificado: usuario.verificado ? true : false
        }
    }

}


// REGISTRO
// crea el usuario y, si es refugio, también la fila en `refugios`
async function registrar(datos){

    const { nombre, email, password, tipo, telefono, ciudad, cif } = datos

    if(!nombre || !email || !password){
        throw new BadRequestError('Faltan datos')
    }

    if(tipo !== 'adoptante' && tipo !== 'protectora'){
        throw new BadRequestError('Tipo de usuario no válido')
    }

    if(tipo === 'protectora' && !cif){
        throw new BadRequestError('El CIF es obligatorio para refugios')
    }

    // comprobamos que el email no esté ya registrado
    const existente = await usuariosRepo.buscarPorEmail(email)

    if(existente){
        throw new ConflictError('El email ya está registrado')
    }

    // los adoptantes nacen verificados; los refugios necesitan aprobación
    const verificado = tipo === 'adoptante'

    // hasheo de la contraseña (irreversible)
    const hash = bcrypt.hashSync(password, config.bcryptRounds)

    const nuevoId = await usuariosRepo.crear({
        nombre,
        email,
        password: hash,
        tipo,
        verificado,
        telefono,
        ciudad
    })

    // si es refugio, además creamos la fila en `refugios` con el CIF
    if(tipo === 'protectora'){

        await usuariosRepo.crearRefugio(nuevoId, cif)

        // el refugio queda pendiente: NO devolvemos token
        return {
            pendiente: true,
            mensaje: 'Hemos recibido tu solicitud. Te avisaremos cuando el administrador verifique tu refugio.'
        }

    }

    // adoptante: devolvemos token para login automático
    return {
        token: generarToken(nuevoId, tipo),
        usuario: {
            id: nuevoId,
            nombre,
            email,
            tipo,
            verificado: true
        }
    }

}


module.exports = {
    login,
    registrar
}