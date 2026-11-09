const { ErroServicoExterno } = require('./erros');

const URL_BASE = process.env.OPEN_FOOD_FACTS_URL || 'https://world.openfoodfacts.org';
const CAMPOS = 'product_name,product_name_pt,brands,image_front_url';

async function buscarProdutoPorCodigo(codigoBarras) {
    let resposta;
    try {
        resposta = await fetch(`${URL_BASE}/api/v2/product/${codigoBarras}.json?fields=${CAMPOS}`, {
            headers: { 'User-Agent': 'GerenciamentoDeEstoque/1.0' },
            signal: AbortSignal.timeout(10000),
        });
    } catch {
        throw new ErroServicoExterno('Não foi possível consultar a Open Food Facts no momento');
    }

    if (resposta.status === 404) {
        return null;
    }
    if (!resposta.ok) {
        throw new ErroServicoExterno('A Open Food Facts está indisponível no momento');
    }

    const dados = await resposta.json();
    if (dados.status !== 1 || !dados.product) {
        return null;
    }

    const produto = dados.product;
    const nome = (produto.product_name_pt || produto.product_name || '').trim();
    const marca = (produto.brands || '').split(',')[0].trim();

    return {
        codigo_barras: codigoBarras,
        nome: nome ? nome.slice(0, 100) : null,
        marca: marca ? marca.slice(0, 100) : null,
        imagem_url: produto.image_front_url ?? null,
    };
}

module.exports = { buscarProdutoPorCodigo };
