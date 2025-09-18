import { Router } from "express";
import pagamentoCertificadoController from "../Controllers/pagamentoController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de pagamento exigem que o usuário esteja autenticado.

router.post("/", loginRequired, pagamentoCertificadoController.store);

router.get("/", loginRequired, pagamentoParceiroController.show);

router.get(
  "/:parceiroId",
  loginRequired,
  pagamentoParceiroController.findByParceiro
);

export default router;
