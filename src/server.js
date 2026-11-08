const express = require('express');
const pool = require('./database');
const routes = require('./routes');
const { RotaNaoEncontrada, TratarErros } = require('./middlewares/tratarErros');

const app = express();

const PORT = process.env.PORT || 3000;
const TENTATIVAS_CONEXAO = 10;

app.use(express.json());
app.use(routes);
app.use(RotaNaoEncontrada);
app.use(TratarErros);

function esperar(milissegundos) {
    return new Promise((resolve) => setTimeout(resolve, milissegundos));
}

async function conectarBanco() {
    for (let tentativa = 1; tentativa <= TENTATIVAS_CONEXAO; tentativa++) {
        try {
            const connection = await pool.getConnection();
            connection.release();
            return;
        } catch (error) {
            console.error(`Tentativa ${tentativa}/${TENTATIVAS_CONEXAO} de conectar ao MySQL falhou: ${error.message}`);
            if (tentativa === TENTATIVAS_CONEXAO) {
                throw error;
            }
            await esperar(3000);
        }
    }
}

async function iniciarServidor() {
    if (!process.env.JWT_SECRET) {
        console.error('A variável JWT_SECRET não foi definida no .env.');
        process.exit(1);
    }

    try {
        await conectarBanco();
        console.log('Conexão com o MySQL realizada com sucesso.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`API aberta na porta ${PORT}`);
        });
    } catch {
        console.error('Não foi possível conectar ao MySQL. Encerrando.');
        process.exit(1);
    }
}

iniciarServidor();
