USE estoque_db;

CREATE TABLE categoria (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE produto (
    id_produto INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    id_categoria INT NOT NULL,
    preco_venda DECIMAL(10,2) NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    quantidade_minima INT NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT,

    CHECK (preco_venda IS NULL OR preco_venda >= 0),
    CHECK (quantidade_estoque >= 0),
    CHECK (quantidade_minima IS NULL OR quantidade_minima >= 0)
);
CREATE TABLE movimentacao_estoque (
    id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
    id_produto INT NOT NULL,
    tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
        ON DELETE CASCADE,

    CHECK (quantidade > 0)
);
