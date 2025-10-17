import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import contratosController from "../Controllers/contratosController.js";

const router = new Router();

router.post("/", loginRequired, contratosController.store);
router.put("/:id", loginRequired, contratosController.update);

export default router;
