import { Router } from "express";
import parceiroController from "../Controllers/parceiroController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de parceiros exigem que o usuário esteja autenticado.

// Lista todos os parceiros
router.get("/", loginRequired, parceiroController.index);

// Cria um novo parceiro
router.post("/", loginRequired, parceiroController.store);

// Exibe um parceiro específico
router.get("/:id", loginRequired, parceiroController.show);

// Atualiza um parceiro
router.put("/:id", loginRequired, parceiroController.update);

// Deleta um parceiro
router.delete("/:id", loginRequired, parceiroController.destroy);

export default router;
