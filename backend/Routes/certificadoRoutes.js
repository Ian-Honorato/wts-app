import { Router } from "express";
import certificadoController from "../Controllers/certificadoController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de certificados exigem que o usuário esteja autenticado.

// Lista todos os certificados
router.get("/", loginRequired, certificadoController.index);

// Cria um novo certificado
router.post("/", loginRequired, certificadoController.store);

// Exibe um certificado específico
router.get("/:id", loginRequired, certificadoController.show);

// Atualiza um certificado
router.put("/:id", loginRequired, certificadoController.update);

// Deleta um certificado
router.delete("/:id", loginRequired, certificadoController.destroy);

export default router;
