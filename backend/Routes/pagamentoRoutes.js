import { Router } from "express";
import pagamentoController from "../Controllers/pagamentoController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de pagamento exigem que o usuário esteja autenticado.
router.post(
  "/pagamentos",
  loginRequired,
  pagamentoController.ConfirmarPagamento
);

router.get("/", loginRequired, pagamentoController.index);

router.get("/pendentes", loginRequired, pagamentoController.buscarPendentes);

export default router;
