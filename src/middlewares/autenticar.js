const jwt = require('jsonwebtoken');


//Função feita para autenticação de tokens de usuario.
function AutenticarUsuario(req, res, next){

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

//Função feita para controlar restringir o acesso aos administradores.
function SomenteAdmin(req, res, next){
    if(req.usuario.perfil !== 'ADMIN'){
        return res.status(403).json({erro: 'Sem autorização para realizar essa ação'});
    }
    next();
}

module.exports = {AutenticarUsuario, SomenteAdmin};