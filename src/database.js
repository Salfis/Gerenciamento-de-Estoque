require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    decimalNumbers: true,
});

/**
 * Executa a função recebida dentro de uma transação. Se qualquer etapa falhar,
 * todas as alterações são desfeitas (rollback), mantendo o banco consistente.
 */
async function transacao(funcao) {
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const resultado = await funcao(conexao);
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

module.exports = { pool, transacao };
