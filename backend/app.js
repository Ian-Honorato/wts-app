//importações referentes ao express e dependencias
import express from "express";

//importações referentes as rotas

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }
  middlewares() {
    this.app.use(express.json());
  }
  routes() {}
}
export default new App().app;
