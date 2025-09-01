import { Router } from "express";
import clienteController from "../Controllers/clienteController.js";
import loginRequired from "../Middlewares/loginRequired.js";

const router = new Router();

// --- ROTAS PRIVADAS ---
// Todas as rotas de cliente exigem que o usuário esteja autenticado.

// Rota para buscar contratos que vencem nos próximos 30 dias
router.get(
  "/contratos/vencendo",
  loginRequired,
  clienteController.findByContract
);

// Rota para buscar a lista completa de clientes com todos os dados associados
router.get("/details", loginRequired, clienteController.findBasic);
router.post("/contratos", loginRequired, clienteController.findByContract);

// --- ROTAS CRUD PADRÃO ---

router.get("/", loginRequired, clienteController.index);

// Lista todos os clientes (retorna dados mais simples)
router.get("/search", loginRequired, clienteController.search);

// Exibe um cliente específico com todos os seus dados associados
router.get("/:id", loginRequired, clienteController.show);

// Cria um novo Cliente e seu contrato inicial
router.post("/cadastrar", loginRequired, clienteController.store);

// Atualiza um cliente e seu contrato
router.put("/:id", loginRequired, clienteController.update);

// Deleta um cliente
router.delete("/:id", loginRequired, clienteController.destroy);

export default router;
