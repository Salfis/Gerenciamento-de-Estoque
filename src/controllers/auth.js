const bcrypt = require('bcryptjs');
const pool = require('../database');
const jwt = require('jsonwebtoken');


async function LoginUsuario(req,res){
    const {email, senha} = req.body;

    if(!email || !senha){
        return res.status(400).json({erro: 'Todos os campos são obrigatórios(email, senha)'});
    }
    
    try{
        //verifico se usuario existe e salvo em uma variável caso ele exista.
        const [usuarios] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
        const usuario = usuarios[0];
        if(!usuario){
            return res.status(401).json({erro: 'E-mail ou senha inválidos.'});
        }

        //verifico se a senha está correta.
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if(!senhaCorreta){
            return res.status(401).json({erro: 'E-mail ou senha inválidos.'});
        }

        //gero um token para mandar pro usuário.
        const token = jwt.sign(
                {id: usuario.id_usuario, perfil: usuario.perfil},
                process.env.JWT_SECRET,
                {expiresIn: '8h'}
        );

        return res.status(200).json({ id_usuario: usuario.id_usuario, nome: usuario.nome, email, perfil: usuario.perfil, token});

    } catch(erro){
        console.log(erro);
        return res.status(500).json({erro: 'Erro interno durante o login...'});
    }

}

module.exports = LoginUsuario;
