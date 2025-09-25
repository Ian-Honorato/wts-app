/**
 * @file app.js
 * @description Arquivo principal de configuração do servidor Express.
 * Este arquivo é responsável por instanciar o Express, aplicar middlewares globais
 * como CORS e o parser de JSON, e registrar todas as rotas da aplicação.
 * A estrutura utiliza uma classe 'App' para encapsular a lógica de configuração do servidor.
 */

//importações referentes ao express e dependencias
import express from "express";
import cors from "cors";
//importações referentes as rotas
import usuariosRoutes from "./Routes/usuarioRoutes.js";
import clientesRoutes from "./Routes/clienteRoutes.js";
import parceirosRoutes from "./Routes/parceiroRoutes.js";
import certificadosRoutes from "./Routes/certificadoRoutes.js";
import pagamentoRoutes from "./Routes/pagamentoRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";

/**
 * @class App
 * @description Encapsula a configuração e inicialização do servidor Express.
 */ class App {
  constructor() {
    /**
     * @property {object} app - A instância principal do Express.
     */
    this.app = express();
    // Orquestra a execução dos métodos de configuração.
    this.middlewares();
    this.routes();
  }
  /**
   * @method middlewares
   * @description Configura e aplica os middlewares que serão utilizados em todas as requisições.
   */
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }
  /**
   * @method routes
   * @description Agrupa e registra todos os módulos de rotas da aplicação,
   * associando cada um a um prefixo de URL base.
   */
  routes() {
    this.app.use("/usuarios", usuariosRoutes); // Rotas para gerenciamento de usuários.
    this.app.use("/clientes", clientesRoutes); // Rotas para o CRUD de clientes.
    this.app.use("/parceiros", parceirosRoutes); // Rotas para o CRUD de parceiros.
    this.app.use("/certificados", certificadosRoutes); // Rotas para operações com certificados.
    this.app.use("/upload", uploadRoutes); // Rotas para o upload de arquivos (ex: XML).
    this.app.use("/dashboard", dashboardRoutes); // Rotas que fornecem dados para o dashboard.
    this.app.use("/financeiro", pagamentoRoutes); // Rotas para processamento de pagamentos e finanças.
  }
}
// Exporta a instância configurada do Express para ser utilizada pelo
// arquivo que de fato irá iniciar o servidor (ex: server.js).
export default new App().app;
