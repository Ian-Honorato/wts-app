//importações referentes ao express e dependencias
import express from "express";
import cors from "cors";
//importações referentes as rotas
import usuariosRoutes from "./Routes/usuarioRoutes.js";
import clientesRoutes from "./Routes/clienteRoutes.js";
import parceirosRoutes from "./Routes/parceiroRoutes.js";
import certificadosRoutes from "./Routes/certificadoRoutes.js";
import pagamentoParceiroRoutes from "./Routes/pagamentoParceiroRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";
class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }
  routes() {
    this.app.use("/usuarios", usuariosRoutes);
    this.app.use("/clientes", clientesRoutes);
    this.app.use("/parceiros", parceirosRoutes);
    this.app.use("/certificados", certificadosRoutes);
    this.app.use("/pagamentos", pagamentoParceiroRoutes);
    this.app.use("/upload", uploadRoutes);
    this.app.use("/dashboard", dashboardRoutes);
  }
}
export default new App().app;
