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

//funcao para recuperar a senha com o código recebido por email.
async function RedefinirSenha(req,res){
    const {token, novaSenha} = req.body;

    //verifico se foi passado o token e a senha, e se tiver sido passado, eu transformo o token em hash da mesma forma que fiz no "esqueci-senha"
    if(!token || !novaSenha){
        return res.status(400).json({erro: 'Ambos os campos são obrigatórios...'});
    }
    const tokenVerifier = crypto.createHash('sha256').update(token).digest('hex');

    try{
        //faz a checagem se existe alguma recuperacao de senha com esse token
        const [recuperacoes] = await pool.query(
            'SELECT * FROM recuperacao_senha WHERE token_hash = ? AND usado = FALSE AND expira_em > NOW()',
            [tokenVerifier]
        )
        //crio uma variavel que guarda as informacoes da recuperacao de senha.
        const recuperacao = recuperacoes[0];
        if(!recuperacao){
            return res.status(400).json({erro: 'Token Inválido ou Expirado...'});
        }
        
        //criptografo a nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        //update da senha do usuário  
        await pool.query(
            'UPDATE usuario SET senha_hash = ? WHERE id_usuario = ?',
            [senhaHash, recuperacao.id_usuario]
        );

        //update do estado da recuperacao de senha, para nao poder ser utilizada de novo
        await pool.query(
            'UPDATE recuperacao_senha SET usado = TRUE WHERE id = ?',
            [recuperacao.id]
        );

    }catch(erro){
        console.log(erro);
        return res.status(500).json({erro: 'Erro interno durante a recuperação da senha...'});
    }

    return res.status(200).json({mensagem: 'Senha redefinida com sucesso...'});
    
}

module.exports = {LoginUsuario, EsqueciSenha, RedefinirSenha};
