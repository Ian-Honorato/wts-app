import { Router } from "express";
import pagamentoController from "../Controllers/pagamentoController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de pagamento exigem que o usuário esteja autenticado.
router.get("/sumario", loginRequired, pagamentoController.sumarioFinanceiro);

router.get("/detalhes/:id", loginRequired, pagamentoController.listarHistorico);

router.post("/pagamentos", loginRequired, pagamentoController.criarPagamento);

router.get("/", loginRequired, pagamentoController.index);

router.get("/pendentes", loginRequired, pagamentoController.buscarPendentes);

export default router;
