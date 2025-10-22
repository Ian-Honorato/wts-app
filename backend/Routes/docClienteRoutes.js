import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import docsUpload from "../Config/docs_upload.js";
import docClienteController from "../Controllers/docClienteController.js";

const router = new Router();
//criar
router.post(
  "cadastrar/:id",
  loginRequired,
  docsUpload.single("arquivo"),
  docClienteController.store
);
//listar por cliente
router.get("/listar/:id", loginRequired, docClienteController.findByCliente);

//deletar
router.delete("/deletar/:id", loginRequired, docClienteController.delete);

export default router;
