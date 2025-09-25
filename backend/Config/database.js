/**
 * @file config/database.js
 * @description Arquivo de configuração da conexão do Sequelize com o banco de dados.
 * Centraliza todas as variáveis e opções de conexão, lendo dados sensíveis
 * a partir de variáveis de ambiente para maior segurança.
 */

// Carrega as variáveis de ambiente do arquivo .env para process.env
require("dotenv").config();

module.exports = {
  // --- Configurações de Conexão Principais ---
  dialect: "mariadb", // Especifica o dialeto do banco de dados a ser utilizado.
  host: process.env.DATABASE_HOST, // Endereço do servidor do banco de dados.
  port: process.env.DATABASE_PORT, // Porta de conexão do servidor do banco de dados.
  username: process.env.DATABASE_USER, // Nome de usuário para autenticação.
  password: process.env.DATABASE_PASS || "", // Senha do usuário. O '|| ""' serve como fallback para ambientes de dev sem senha.
  database: process.env.DATABASE, // Nome do banco de dados (schema) a ser utilizado.

  /**
   * @property {object} define - Opções globais para todos os Models definidos pelo Sequelize.
   * Isso garante um padrão consistente em toda a aplicação.
   */

  define: {
    // Adiciona automaticamente os campos 'createdAt' e 'updatedAt' em todas as tabelas.
    timestamps: true,
    // Converte nomes de campos de camelCase (ex: clienteId) para snake_case (ex: cliente_id) no banco de dados.
    underscored: true,
    underscoredAll: true,
    // Renomeia explicitamente os campos de timestamp para o padrão com underscore.
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  /**
   * @property {object} dialectOptions - Opções específicas para o dialeto do banco (MariaDB).
   */
  dialectOptions: {
    // Garante que a conexão com o banco de dados use o fuso horário correto.
    timezone: "-03:00",
  },
  // Define o fuso horário que o Sequelize utilizará para ler e escrever datas no banco.
  // Essencial para evitar problemas de conversão de datas e horas.
  timezone: "-03:00", // Fuso horário de Brasília (BRT)
};
