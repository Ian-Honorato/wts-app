/**
 * @file app.js
 * @description Arquivo principal de configuração do servidor Express.
 * Este arquivo é responsável por instanciar o Express, aplicar middlewares globais
 * de segurança e utilidades, e registrar todas as rotas da aplicação.
 * A estrutura utiliza uma classe 'App' para encapsular a lógica de configuração do servidor.
 */

// Importações do Express e middlewares de segurança/utilidades
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import morgan from "morgan";

// Importações das rotas da aplicação
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
 */
class App {
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
   * A ordem de aplicação dos middlewares é importante para a segurança e performance.
   */
  middlewares() {
    // --- Configuração do CORS com Whitelist ---
    const whitelist = [
      "http://72.60.13.212",
      " http://ian-honorato.com.br",
      " https://ian-honorato.com.br ",
    ]; // Adicione outras origens permitidas aqui
    const corsOptions = {
      origin: (origin, callback) => {
        // Permite requisições sem 'origin' (ex: Postman, apps mobile) ou que estejam na whitelist
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Acesso não permitido pelo CORS"));
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    };
    this.app.use(cors(corsOptions));

    // --- Middlewares de Segurança ---

    //Define diversos headers HTTP de segurança
    this.app.use(helmet());

    //Implementa um limitador de requisições (Rate Limiter)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // Janela de 15 minutos
      max: 200, // Limita cada IP a 200 requisições por janela
      message:
        "Muitas requisições enviadas deste IP, por favor, tente novamente após 15 minutos.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    //Limita o tamanho do corpo da requisição para prevenir ataques de DoS
    this.app.use(express.json({ limit: "10kb" }));

    //Sanitiza os dados recebidos para prevenir NoSQL Injection
    this.app.use(mongoSanitize());

    // Sanitiza os dados para prevenir ataques de Cross-Site Scripting (XSS)
    this.app.use(xss());

    //Previne a poluição de parâmetros HTTP (HPP - HTTP Parameter Pollution)
    this.app.use(hpp());

    // --- Middlewares de Utilidade ---

    //logger de requisições HTTP (apenas em ambiente de desenvolvimento)
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    }
  }

  /**
   * @method routes
   * @description Agrupa e registra todos os módulos de rotas da aplicação,
   * associando cada um a um prefixo de URL base.
   */
  routes() {
    this.app.use("/usuarios", usuariosRoutes);
    this.app.use("/clientes", clientesRoutes);
    this.app.use("/parceiros", parceirosRoutes);
    this.app.use("/certificados", certificadosRoutes);
    this.app.use("/upload", uploadRoutes);
    this.app.use("/dashboard", dashboardRoutes);
    this.app.use("/financeiro", pagamentoRoutes);
  }
}

// Exporta a instância configurada do Express para ser utilizada pelo
// arquivo que de fato irá iniciar o servidor (ex: server.js).
export default new App().app;
