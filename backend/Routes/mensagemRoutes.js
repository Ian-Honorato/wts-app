import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import mensagemController from "../Controllers/mensagemController.js";

const router = new Router();

router.post("/clientes", loginRequired, mensagemController.enviarTodos);

export default router;
