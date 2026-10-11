const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/health', (req,res) => {
    return res.status(200).json("API de estoque funcionando...");
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})