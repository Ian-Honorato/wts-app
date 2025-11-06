import { Router } from "express";
import { utils, writeFile } from "xlsx";
import downloadController from "../Controllers/downloadController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de certificados exigem que o usuário esteja autenticado.

// Lista todos os certificados
router.get("/clientes", loginRequired, downloadController.downloadXls);
router.get(
  "/financeiro",
  loginRequired,
  downloadController.downloadXlsFinanceiro
);

export default router;
