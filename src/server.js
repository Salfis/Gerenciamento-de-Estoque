const express = require('express');
const pool = require('./database');
const routes = require('./routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(routes);

//Essa função testa a conexão, se conseguir conectar, liga o servidor na porta definida;
async function iniciarServidor() {
    try{
        const connection = await pool.getConnection();

        console.log('Conexão com o MySQL realizada com sucesso.');

        connection.release();

        app.listen(PORT,'0.0.0.0', ()=>{
            console.log(`API aberta na porta ${PORT}`);
        });
    } catch(error){
        console.error('Erro ao conectar com o MySQL:');
        console.error(error.message);
    }
}

iniciarServidor();