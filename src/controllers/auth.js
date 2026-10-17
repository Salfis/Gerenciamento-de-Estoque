const bcrypt = require('bcryptjs');
const pool = require('../database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarEmail } = require('../services/email');

//Função de Login para os usuários
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

//função de enviar email para recuperação de senha.
async function EsqueciSenha(req,res){
    const {email} = req.body;
    if(!email){
         return res.status(400).json({erro: 'O email é obrigatório...'});
    }
    try{
        const [EmailCadastrado] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
        const usuario = EmailCadastrado[0];
        if(!usuario){
            return res.status(200).json({mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.'}); //Não digo que o email não é cadastrado para não 'vazar' quais emails estão cadastrados.
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await pool.query(
            'INSERT into recuperacao_senha (id_usuario, token_hash, expira_em) VALUES (?,?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))',
            [usuario.id_usuario, tokenHash]
        );

        await enviarEmail(email, 'Recuperação de senha', 'Seu código de recuperação é: ' + token + '. Ele expira em 30 minutos.');
        
    
    }catch(erro){
        console.log(erro);
        return res.status(500).json({erro: 'Erro interno durante a validação do email...'});
    }

    return res.status(200).json({mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.'});
}



module.exports = {LoginUsuario, EsqueciSenha};
