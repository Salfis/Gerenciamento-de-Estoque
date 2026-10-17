const jwt = require('jsonwebtoken');

function AutenticarUsuario(req,res,next){

    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({erro: 'Token não informado...'});
    }

    const partes = header.split(' ');
    const token = partes[1];

    try{
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = dados;

    } catch(erro){
        return res.status(401).json({erro: 'Token inválido ou expirado...'});
    }  

    next();
}  

module.exports = {AutenticarUsuario};