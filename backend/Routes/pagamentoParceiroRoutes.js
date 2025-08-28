import { Router } from "express";
import pagamentoParceiroController from "../Controllers/pagamentoParceiroController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de pagamento exigem que o usuário esteja autenticado.

// Registra um novo pagamento para um parceiro
router.post("/", loginRequired, pagamentoParceiroController.store);

router.post(
  "/calcular/:parceiroId",
  loginRequired,
  pagamentoParceiroController.findByParceiro
);
// Exibe um registro de pagamento específico
router.get("/:id", loginRequired, pagamentoParceiroController.show);

export default router;
