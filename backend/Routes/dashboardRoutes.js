import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import dashboardController from "../Controllers/dashboardController.js";

const router = new Router();

router.get("/sumario", loginRequired, dashboardController.getSummary);

export default router;
