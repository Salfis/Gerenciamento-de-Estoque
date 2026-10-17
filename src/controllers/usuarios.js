const bcrypt = require('bcryptjs');
const pool = require('../database');


async function CadastrarUsuario(req,res){
    const {nome, email, senha, perfil } = req.body;

    //verifica se estes campos foram fornecidos.
    if (!nome || !email || !senha){
        return res.status(400).json({erro: 'Todos os campos devem ser preenchidos...'});
    }
    
    //valida se o perfil é válido. Se estiver vazio é definido como operador por padrão.
    const perfilFinal = perfil || 'OPERADOR';
    if(perfilFinal !== 'OPERADOR' && perfilFinal !== 'ADMIN'){
        return res.status(400).json({erro: 'Tipo de usuário inválido...'});
    }

    //encriptando a senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        const [resultado] = await pool.query(
            'INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, perfilFinal]
        );

        return res.status(201).json({ id_usuario: resultado.insertId, nome, email, perfil: perfilFinal });
    } catch(erro){
        if(erro.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({erro: 'Emails duplicados não são permitidos...'});
        } else{
            console.log(erro);
            return res.status(500).json({erro: 'Erro interno na criação do usuário...'});
        }
    }
}


module.exports = {CadastrarUsuario, };