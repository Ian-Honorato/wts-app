import { Router } from "express";
import usuarioController from "../Controllers/usuarioController.js";
import logindRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PÚBLICAS ---
// Rota para autenticar um usuário e obter um token
router.post("/login", usuarioController.login);

// --- ROTAS PRIVADAS ---
// Lista todos os usuários (protegido, requer admin no controller)
router.get("/", logindRequired, usuarioController.index);

// Cria um novo usuário (protegido, requer admin no controller)
router.post("/cadastrar", logindRequired, usuarioController.store);

// Exibe um usuário específico (protegido, requer admin no controller)
router.get("/:id", logindRequired, usuarioController.show);

// Atualiza um usuário (protegido, regras de admin/próprio usuário no controller)
router.put("/:id", logindRequired, usuarioController.update);

// Deleta um usuário (protegido, requer admin no controller)
router.delete("/:id", logindRequired, usuarioController.destroy);

export default router;
