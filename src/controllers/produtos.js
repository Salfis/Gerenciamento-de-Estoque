const pool = require('../database');

//Listagem de Produtos
async function ListarProdutos(req, res){
    const [produtos] = await pool.query('SELECT * FROM produto');
    return res.status(200).json(produtos);
}

//Adição de Produtos
async function AdicionarProdutos(req,res){
    const {sku, nome, marca, id_categoria, preco_venda, quantidade_estoque, quantidade_minima} = req.body;


    if(!sku || !nome || !marca || !id_categoria){
        return res.status(400).json({erro: 'sku, nome, marca e id_categoria são obrigatórios...'});
    }

    //Trato os campos não obrigatórios
    const preco = preco_venda ?? null;
    const minima = quantidade_minima ?? null;
    const estoque = quantidade_estoque ?? 0;


    //Verifico se os campos não obrigatórios estão condizentes com os requisitos
    if(preco !== null && (typeof preco !== 'number' || preco < 0)){
        return res.status(400).json({erro: 'preco_venda deve ser um número maior ou igual a 0'});
    }
    if(minima !== null && (!Number.isInteger(minima) || minima < 0)){
        return res.status(400).json({erro: 'quantidade_minima deve ser um inteiro maior ou igual a 0'});
    }
    if(!Number.isInteger(estoque) || estoque < 0){
        return res.status(400).json({erro: 'quantidade_estoque deve ser um inteiro maior ou igual a 0'});
    }

    try{
        //Adiciono o produto no banco de dados;
        const [resultado] = await pool.query(
            'INSERT INTO produto (sku, nome, marca, id_categoria, preco_venda, quantidade_estoque, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sku, nome, marca, id_categoria, preco, estoque, minima]
        );

        //retorno o ID, nome, marca e id da categoria do produto que foi inserido
        return res.status(201).json({id_produto: resultado.insertId, nome, marca, id_categoria});
    }catch(erro){
        //codigo do erro de entrada repetida (achei os códigos com console.log(erro.code))
        if(erro.code == 'ER_DUP_ENTRY'){
            return res.status(409).json({erro: 'O SKU deve ser único...'});
        //código do erro entrada inválida, nesse caso seria pra tratar erro de categoria nao existente
        }else if(erro.code == 'ER_NO_REFERENCED_ROW_2'){
            return res.status(404).json({erro: 'Categoria não encontrada...'});
        }else{
            console.log(erro);
            return res.status(500).json({erro: 'Erro interno ao processar o cadastro do produto'});
        }
    }
}

module.exports = { ListarProdutos, AdicionarProdutos };