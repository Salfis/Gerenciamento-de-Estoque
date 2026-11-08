const pool = require('../database');

async function ListarCategorias(req, res){
    const [categorias] = await pool.query('SELECT * FROM categoria');
    return res.status(200).json(categorias);
}


async function CriarCategorias(req,res){
    const { nome } = req.body;

    if(!nome){
        return res.status(400).json({erro: 'O nome da categoria é obrigatório'});
    }
    try{
        const [resultado] = await pool.query(
            'INSERT INTO categoria (nome) VALUES (?)',
            [nome]
        );

        //Devolve o id e o nome da categoria cadastrada.
        return res.status(201).json({id_categoria: resultado.insertId, nome});
    } catch(erro){
        //Tratamento de erro ao tentar cadastrar categorias de nomes iguais.
        if(erro.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({erro: 'Nomes duplicados não são permitidos'});
        } else{
            //Erros mais generalizados do backend
            console.log(erro);
            res.status(500).json({erro: 'Erro interno na criação da categoria'});
        }
    }
    
}

async function DeletarCategorias(req,res){
    const { id } = req.params;
    try{
        const [resultado] = await pool.query(
            'DELETE FROM categoria WHERE id_categoria = ?', 
            [id]
        );
        
        if(resultado.affectedRows === 0){
            return res.status(404).json({ erro: 'Categoria não encontrada...' });
        }

        return res.status(204).send();
        //Adicionei um tratamento de erro ao tentar deletar categorias que tem produto dentro, 
        // agora que eu adiiconei o CRUD dos produtos também.
    }catch(erro){
        if(erro.code === 'ER_ROW_IS_REFERENCED_2'){
            return res.status(409).json({ erro: 'Não é possível excluir: existem produtos nessa categoria.' });
        }
        console.log(erro);
        return res.status(500).json({ erro: 'Erro interno ao excluir a categoria' });
    }
}

async function EditarCategorias(req,res){
    const {id} = req.params;
    const {nome} = req.body;


    if(!nome){
        return res.status(400).json({erro: 'Um nome novo é obrigatório...'});
    }
    try {
        const [resultado] = await pool.query(
        'UPDATE categoria SET nome = ? WHERE id_categoria = ?',
        [nome, id]
        );

        if(resultado.affectedRows === 0){
           return res.status(404).json({ erro: 'Categoria não encontrada...' });
        }

        return res.status(200).json({ id_categoria: id, nome });
    } catch (erro) {
        if(erro.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({erro: 'Nomes duplicados não são permitidos'});
        } else{
            console.log(erro);
            res.status(500).json({erro: 'Erro interno na edição da categoria'});
        }
    }
}

module.exports = {ListarCategorias, CriarCategorias, DeletarCategorias, EditarCategorias};