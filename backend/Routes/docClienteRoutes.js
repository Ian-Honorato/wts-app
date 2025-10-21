import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import docsUpload from "../Config/docs_upload.js";
import docClienteController from "../Controllers/docClienteController.js";

const router = new Router();

router.post(
  "/clientes/:id/documento",
  loginRequired,
  docsUpload.single("arquivo"),
  docClienteController.store
);

export default router;
