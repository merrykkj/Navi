-- =================================================================================
-- PASSO 1: CONFIGURAÇÃO DO BANCO DE DADOS
-- =================================================================================

CREATE DATABASE IF NOT EXISTS navi;
USE navi;


-- =================================================================================
-- PASSO 2: CRIAÇÃO DE TODAS AS TABELAS
-- =================================================================================

-- Tabela principal de usuários. A fonte da verdade para autenticação e papéis.
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `url_foto_perfil` VARCHAR(255) NULL,
    `papel` ENUM('ADMINISTRADOR', 'PROPRIETARIO', 'FUNCIONARIO') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expires` DATETIME NULL,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para os estacionamentos. Cada um pertence a um PROPRIETARIO.
CREATE TABLE IF NOT EXISTS `estabelecimentos` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `proprietario_id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL UNIQUE,
    `cep` VARCHAR(9) NOT NULL,
    `rua` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(20) NOT NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `estado` VARCHAR(2) NOT NULL,
    `endereco_completo` VARCHAR(500) GENERATED ALWAYS AS (CONCAT(rua, ', ', numero, ' - ', bairro, ', ', cidade, ' - ', estado, ', ', cep)) STORED,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(10, 8) NULL,
    `url_foto_principal` VARCHAR(255) NULL,
    `horario_abertura` TIME,
    `horario_fechamento` TIME,
    `dias_funcionamento` VARCHAR(100),
    `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`proprietario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Tabela que vincula usuários (com papel FUNCIONARIO) a um ou mais estabelecimentos.
CREATE TABLE IF NOT EXISTS `estacionamento_funcionarios` (
    `estabelecimento_id` VARCHAR(36) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `permissao` ENUM('GESTOR', 'OPERADOR') NOT NULL,
    `data_admissao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`estabelecimento_id`, `usuario_id`),
    FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Tabela para as vagas de um estacionamento.
CREATE TABLE IF NOT EXISTS `vagas` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `estabelecimento_id` VARCHAR(36) NOT NULL,
    `identificador` VARCHAR(20) NOT NULL,
    `tipo_vaga` ENUM('CARRO', 'MOTO', 'PCD', 'IDOSO', 'ELETRICO' , 'V_GRANDES') NOT NULL DEFAULT 'CARRO',
    `status` ENUM('LIVRE', 'OCUPADA', 'RESERVADA', 'MANUTENCAO') NOT NULL DEFAULT 'LIVRE',
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE,
    UNIQUE (`estabelecimento_id`, `identificador`)
);

-- Tabela de veículos cadastrados pelos usuários.
CREATE TABLE IF NOT EXISTS `veiculos` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `usuario_id` VARCHAR(36) NOT NULL,
    `placa` VARCHAR(10) NOT NULL UNIQUE,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(50) NOT NULL,
    `cor` VARCHAR(30) NOT NULL,
    `apelido` VARCHAR(50),
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Tabela de políticas de preço para cada estacionamento.
CREATE TABLE IF NOT EXISTS `politicas_preco` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `estabelecimento_id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `preco_primeira_hora` DECIMAL(10, 2) NOT NULL,
    `preco_horas_adicionais` DECIMAL(10, 2) NOT NULL,
    `preco_diaria` DECIMAL(10, 2) NOT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT TRUE,
    `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE,
    UNIQUE KEY (`estabelecimento_id`, `nome`)
);

-- Tabela de planos para mensalistas.
CREATE TABLE IF NOT EXISTS `planos_mensais` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `estabelecimento_id` VARCHAR(36) NOT NULL,
    `nome_plano` VARCHAR(100) NOT NULL,
    `descricao` TEXT,
    `preco_mensal` DECIMAL(10, 2) NOT NULL,
    `popular` BOOLEAN DEFAULT FALSE,
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE,
    UNIQUE (`estabelecimento_id`, `nome_plano`)
);

-- Tabela que representa o contrato de um usuário a um plano mensal.
CREATE TABLE IF NOT EXISTS `contratos_mensalistas` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `usuario_id` VARCHAR(36) NOT NULL,
    `plano_id` VARCHAR(36) NOT NULL,
    `veiculo_id` VARCHAR(36) NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE,
    `status` ENUM('ATIVO', 'INATIVO', 'CANCELADO') NOT NULL DEFAULT 'ATIVO',
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plano_id`) REFERENCES `planos_mensais`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE CASCADE
);

-- Tabela de reservas de vagas.
CREATE TABLE IF NOT EXISTS `reservas` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `usuario_id` VARCHAR(36) NOT NULL,
    `vaga_id` VARCHAR(36) NOT NULL,
    `veiculo_id` VARCHAR(36) NULL,
    `status` ENUM('ATIVA', 'CONCLUIDA', 'CANCELADA', 'EXPIRADA') NOT NULL,
    `data_hora_inicio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_hora_fim` TIMESTAMP NULL,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`vaga_id`) REFERENCES `vagas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE SET NULL
);

-- Tabela de cupons de desconto, disponíveis para todo o sistema.
CREATE TABLE IF NOT EXISTS `cupons` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `descricao` TEXT NULL,
  `tipo_desconto` ENUM('PERCENTUAL', 'VALOR_FIXO') NOT NULL,
  `valor_desconto` DECIMAL(10, 2) NOT NULL,
  `data_validade` DATE NOT NULL,
  `usos_maximos` INT NULL, -- Nulo para ilimitado
  `usos_atuais` INT NOT NULL DEFAULT 0,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos, vinculada a uma reserva.
CREATE TABLE IF NOT EXISTS `pagamentos` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `reserva_id` VARCHAR(36) NOT NULL UNIQUE,
    `cupom_id` VARCHAR(36) NULL,
    `valor_bruto` DECIMAL(10, 2) NOT NULL,
    `valor_desconto` DECIMAL(10, 2) DEFAULT 0.00,
    `valor_liquido` DECIMAL(10, 2) NOT NULL,
    `metodo` ENUM('PIX', 'DEBITO', 'CREDITO', 'DINHEIRO') NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO') NOT NULL,
    `data_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`reserva_id`) REFERENCES `reservas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`cupom_id`) REFERENCES `cupons`(`id`) ON DELETE SET NULL
);

-- Tabela para avaliações de estacionamentos pelos usuários.
CREATE TABLE IF NOT EXISTS `avaliacoes` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `usuario_id` VARCHAR(36) NOT NULL,
    `estabelecimento_id` VARCHAR(36) NOT NULL,
    `nota` DECIMAL(2, 1) NOT NULL,
    `comentario` TEXT,
    `data_postagem` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE
);

-- Tabela de Logs de Ações importantes no sistema.
CREATE TABLE IF NOT EXISTS `logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` VARCHAR(36) NULL,
  `acao` VARCHAR(255) NOT NULL,
  `detalhes` JSON,
  `ip_origem` VARCHAR(45) NULL,
  `data_ocorrencia` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
);

-- Tabela de Notificações para o Usuário 
CREATE TABLE IF NOT EXISTS `notificacoes` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    `usuario_id` VARCHAR(36) NOT NULL COMMENT 'Para quem é a notificação',
    `autor_acao_nome` VARCHAR(255) NOT NULL COMMENT 'Nome de quem realizou a ação',
    `mensagem` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NULL COMMENT 'Link para a página relevante (opcional)',
    `lida` BOOLEAN NOT NULL DEFAULT FALSE,
    `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Adicionar esta tabela ao seu schema.sql

CREATE TABLE IF NOT EXISTS `caixa_sessoes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `estabelecimento_id` VARCHAR(36) NOT NULL,
  `usuario_id` VARCHAR(36) NOT NULL COMMENT 'ID do funcionário que operou o caixa',
  `data_abertura` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_fechamento` TIMESTAMP NULL,
  `valor_abertura` DECIMAL(10, 2) NOT NULL,
  `valor_fechamento` DECIMAL(10, 2) NULL,
  `observacoes` TEXT NULL,
  `status` ENUM('ABERTO', 'FECHADO') NOT NULL DEFAULT 'ABERTO',
  FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

select * from notificacoes;
select * from usuarios;
select * from logs;
-- ================================================================
-- PASSO 2: INSERÇÃO COMPLETA E ORDENADA DOS DADOS DE TESTE
-- ================================================================
SET @senha_padrao = '$2b$10$5c.zMMqbKgTUq1rborporePge43qJFwsCt/Ct90OV1Hp1cdY.2kGO'; -- 12345678

-- Seção 2.1: USUÁRIOS
-- (Independentes de outras tabelas, devem vir primeiro)
-- ----------------------------------------------------------------
-- Usuários Padrão
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `papel`, `ativo`) VALUES
('0a9a6b1a-3e8c-4f0e-9d2a-8c7c7f9a8b1b', 'Admin do Sistema', 'adm@email.com', @senha_padrao, 'ADMINISTRADOR', true),
('1b9a6b1a-3e8c-4f0e-9d2a-8c7c7f9a8b1c', 'Carlos Proprietário', 'proprietario@email.com', @senha_padrao, 'PROPRIETARIO', true),
('func-beatriz-gestora', 'Beatriz Funcionária', 'funcionario@email.com', @senha_padrao, 'FUNCIONARIO', true);

-- 12 Novos Clientes (com role placeholder 'PROPRIETARIO')
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `papel`) VALUES
('cli-01', 'Lucas Pereira', 'lucas.p@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-02', 'Juliana Santos', 'juliana.s@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-03', 'Rafael Oliveira', 'rafael.o@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-04', 'Camila Costa', 'camila.c@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-05', 'Fernando Martins', 'fernando.m@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-06', 'Beatriz Almeida', 'beatriz.a@email.com', @senha_padrao, 'PROPRIETARIO'),
('cli-07', 'Tiago Lima', 'tiago.l@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-08', 'Sofia Rocha', 'sofia.r@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-09', 'Gabriel Mendes', 'gabriel.m@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-10', 'Laura Ferreira', 'laura.f@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-11', 'Matheus Alves', 'matheus.a@email.com', @senha_padrao, 'PROPRIETARIO'), ('cli-12', 'Isabela Gomes', 'isabela.g@email.com', @senha_padrao, 'PROPRIETARIO');

-- 12 Novos Funcionários
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `papel`) VALUES
('func-p1', 'André Souza', 'andre.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-p2', 'Bianca Lima', 'bianca.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-p3', 'Carlos Rocha', 'carlos.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-p4', 'Daniela Alves', 'daniela.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-p5', 'Eduardo Neves', 'eduardo.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-p6', 'Fabiana Gomes', 'fabiana.func@email.com', @senha_padrao, 'FUNCIONARIO'),
('func-fl1', 'Gustavo Pinto', 'gustavo.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-fl2', 'Helena Dias', 'helena.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-fl3', 'Igor Barros', 'igor.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-fl4', 'Larissa Farias', 'larissa.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-fl5', 'Marcos Andrade', 'marcos.func@email.com', @senha_padrao, 'FUNCIONARIO'), ('func-fl6', 'Natália Ribeiro', 'natalia.func@email.com', @senha_padrao, 'FUNCIONARIO');

-- Seção 2.2: ESTACIONAMENTOS
-- (Dependem de `usuarios`, devem vir depois)
-- ----------------------------------------------------------------
INSERT INTO `estabelecimentos` (`id`, `proprietario_id`, `nome`, `cnpj`, `cep`, `rua`, `numero`, `bairro`, `cidade`, `estado`, `latitude`, `longitude`, `ativo`, `horario_abertura`, `horario_fechamento`, `dias_funcionamento`) VALUES
('estac-paulista', '1b9a6b1a-3e8c-4f0e-9d2a-8c7c7f9a8b1c', 'Estacionamento Paulista', '22.222.222/0001-22', '01311-200', 'Avenida Paulista', '1578', 'Bela Vista', 'São Paulo', 'SP', -23.5614, -46.6565, true, '07:00:00', '23:00:00', 'Seg-Sab'),
('estac-faria-lima', '1b9a6b1a-3e8c-4f0e-9d2a-8c7c7f9a8b1c', 'Estacionamento Faria Lima', '33.333.333/0001-33', '05425-070', 'Rua Doutor Rubéns Gomes Bueno', '691', 'Várzea de Baixo', 'São Paulo', 'SP', -23.6231, -46.7025, true, '06:00:00', '22:00:00', 'Seg-Sex');
SET @estac_paulista_id = 'estac-paulista';
SET @estac_farialima_id = 'estac-faria-lima';

-- Seção 2.3: VINCULANDO FUNCIONÁRIOS AOS ESTACIONAMENTOS
-- (Dependem de `usuarios` e `estabelecimentos`)
-- ----------------------------------------------------------------
-- 6 Funcionários para Paulista
INSERT INTO `estacionamento_funcionarios` (`estabelecimento_id`, `usuario_id`, `permissao`) VALUES
(@estac_paulista_id, 'func-beatriz-gestora', 'GESTOR'), 
(@estac_paulista_id, 'func-p1', 'OPERADOR'), (@estac_paulista_id, 'func-p2', 'OPERADOR'), (@estac_paulista_id, 'func-p3', 'OPERADOR'), (@estac_paulista_id, 'func-p4', 'OPERADOR'), (@estac_paulista_id, 'func-p5', 'OPERADOR');
-- 6 Funcionários para Faria Lima
INSERT INTO `estacionamento_funcionarios` (`estabelecimento_id`, `usuario_id`, `permissao`) VALUES
(@estac_farialima_id, 'func-p6', 'GESTOR'), 
(@estac_farialima_id, 'func-fl1', 'OPERADOR'), (@estac_farialima_id, 'func-fl2', 'OPERADOR'), (@estac_farialima_id, 'func-fl3', 'OPERADOR'), (@estac_farialima_id, 'func-fl4', 'OPERADOR'), (@estac_farialima_id, 'func-fl5', 'OPERADOR');

-- Seção 2.4: VAGAS
-- (Dependem de `estabelecimentos`)
-- ----------------------------------------------------------------
INSERT INTO `vagas` (id, estabelecimento_id, identificador, tipo_vaga) VALUES
('vaga-res-p1', @estac_paulista_id, 'R01', 'CARRO'), ('vaga-res-p2', @estac_paulista_id, 'R02', 'ELETRICO'), ('vaga-res-p3', @estac_paulista_id, 'R03', 'CARRO'), ('vaga-res-p4', @estac_paulista_id, 'R04', 'PCD'), ('vaga-res-p5', @estac_paulista_id, 'R05', 'MOTO'), ('vaga-res-p6', @estac_paulista_id, 'R06', 'CARRO'),
('vaga-res-fl1', @estac_farialima_id, 'R01', 'CARRO'), ('vaga-res-fl2', @estac_farialima_id, 'R02', 'IDOSO'), ('vaga-res-fl3', @estac_farialima_id, 'R03', 'MOTO'), ('vaga-res-fl4', @estac_farialima_id, 'R04', 'CARRO'), ('vaga-res-fl5', @estac_farialima_id, 'R05', 'CARRO'), ('vaga-res-fl6', @estac_farialima_id, 'R06', 'PCD');

-- Seção 2.5: VEÍCULOS
-- (Dependem de `usuarios`)
-- ----------------------------------------------------------------
INSERT INTO `veiculos` (id, usuario_id, placa, marca, modelo, cor) SELECT UUID(), id, CONCAT(SUBSTRING(UUID(), 1, 3), '-', LPAD(FLOOR(RAND() * 10000), 4, '0')), 'Marca Teste', 'Modelo Teste', 'Cor Teste' FROM `usuarios` WHERE `email` LIKE '%.%@email.com';

-- Seção 2.6: PLANOS, RESERVAS E AVALIAÇÕES (DADOS FINAIS)
-- ----------------------------------------------------------------
-- Planos e Políticas
INSERT INTO `politicas_preco` (id, estabelecimento_id, nome, preco_primeira_hora, preco_horas_adicionais, preco_diaria) VALUES (UUID(), @estac_paulista_id, 'Tarifa Padrão', 18.00, 10.00, 75.00), (UUID(), @estac_paulista_id, 'Tarifa de Moto', 9.00, 5.00, 35.00);
INSERT INTO `planos_mensais` (`id`, `estabelecimento_id`, `nome_plano`, `descricao`, `preco_mensal`, `popular`) VALUES ('plano-paulista-diurno', @estac_paulista_id, 'Plano Diurno Completo', 'Acesso 8h-18h, Seg-Sex.', 350.00, true), ('plano-paulista-247', @estac_paulista_id, 'Plano 24/7', 'Acesso total.', 450.00, false), ('plano-fl-corp', @estac_farialima_id, 'Plano Corporativo FL', 'Acesso 24/7 para empresas.', 400.00, true);
SET @plano_paulista_id = 'plano-paulista-diurno';
SET @plano_farialima_id = 'plano-fl-corp';

-- 6 Contratos para Paulista
INSERT INTO `contratos_mensalistas` (id, usuario_id, plano_id, veiculo_id, data_inicio, status)
SELECT UUID(), u.id, @plano_paulista_id, v.id, CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY, IF(RAND() > 0.8, 'CANCELADO', 'ATIVO') FROM `usuarios` u JOIN `veiculos` v ON u.id = v.usuario_id WHERE u.email IN ('lucas.p@email.com', 'juliana.s@email.com', 'rafael.o@email.com', 'camila.c@email.com', 'fernando.m@email.com', 'beatriz.a@email.com');
-- 6 Contratos para Faria Lima
INSERT INTO `contratos_mensalistas` (id, usuario_id, plano_id, veiculo_id, data_inicio, status)
SELECT UUID(), u.id, @plano_farialima_id, v.id, CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY, IF(RAND() > 0.8, 'CANCELADO', 'ATIVO') FROM `usuarios` u JOIN `veiculos` v ON u.id = v.usuario_id WHERE u.email IN ('tiago.l@email.com', 'sofia.r@email.com', 'gabriel.m@email.com', 'laura.f@email.com', 'matheus.a@email.com', 'isabela.g@email.com');

-- 6 Reservas para Paulista e 6 para Faria Lima
INSERT INTO `reservas` (id, usuario_id, vaga_id, status) VALUES
(UUID(), (SELECT id from usuarios where email = 'lucas.p@email.com'), 'vaga-res-p1', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'juliana.s@email.com'), 'vaga-res-p2', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'rafael.o@email.com'), 'vaga-res-p3', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'camila.c@email.com'), 'vaga-res-p4', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'fernando.m@email.com'), 'vaga-res-p5', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'beatriz.a@email.com'), 'vaga-res-p6', 'ATIVA'),
(UUID(), (SELECT id from usuarios where email = 'tiago.l@email.com'), 'vaga-res-fl1', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'sofia.r@email.com'), 'vaga-res-fl2', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'gabriel.m@email.com'), 'vaga-res-fl3', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'laura.f@email.com'), 'vaga-res-fl4', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'matheus.a@email.com'), 'vaga-res-fl5', 'ATIVA'), (UUID(), (SELECT id from usuarios where email = 'isabela.g@email.com'), 'vaga-res-fl6', 'ATIVA');

select * from usuarios;
select * from estabelecimentos;

-- 1. Defina o ID do estacionamento que você quer pesquisar.
-- Use 'estac-paulista' ou 'estac-faria-lima'.
SET @estacionamento_id_pesquisa = 'estac-paulista';

-- 2. Rode a consulta.
-- Ela une a tabela de vínculo (estacionamento_funcionarios) com a de usuários
-- para buscar o nome e a permissão dos funcionários.
SELECT 
    u.nome,
    ef.permissao AS cargo
FROM 
    estacionamento_funcionarios AS ef
JOIN 
    usuarios AS u ON ef.usuario_id = u.id
WHERE 
    ef.estabelecimento_id = @estacionamento_id_pesquisa
ORDER BY
    u.nome ASC;

-- 6 Avaliações para Paulista
INSERT INTO `avaliacoes` (id, usuario_id, estabelecimento_id, nota, comentario) SELECT UUID(), id, @estac_paulista_id, ROUND(3 + (RAND() * 2), 1), 'Comentário de teste para o Estacionamento Paulista.' FROM `usuarios` WHERE `email` IN ('lucas.p@email.com', 'juliana.s@email.com', 'rafael.o@email.com', 'camila.c@email.com', 'fernando.m@email.com', 'beatriz.a@email.com');
-- 6 Avaliações para Faria Lima
INSERT INTO `avaliacoes` (id, usuario_id, estabelecimento_id, nota, comentario) SELECT UUID(), id, @estac_farialima_id, ROUND(3 + (RAND() * 2), 1), 'Avaliação de teste para o Estacionamento Faria Lima.' FROM `usuarios` WHERE `email` IN ('tiago.l@email.com', 'sofia.r@email.com', 'gabriel.m@email.com', 'laura.f@email.com', 'matheus.a@email.com', 'isabela.g@email.com');