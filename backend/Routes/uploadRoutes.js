import { Router } from "express";
import upload from "../Config/upload.js";
import loginRequired from "../Middlewares/loginRequired.js";
import XmlUploadController from "../Controllers/xmlUploadController.js";

const router = new Router();

router.post(
  "/clientes",
  upload.single("xmlFile"),
  loginRequired,
  XmlUploadController.store
);
router.get("/teste", (req, res) => {
  res.send("Rota de upload funcionando");
});

export default router;
