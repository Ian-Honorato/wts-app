import { Router } from "express";
import loginRequired from "../Middlewares/loginRequired.js";
import dashboardController from "../Controllers/dashboardController.js";

const router = new Router();

router.get("/sumario", loginRequired, dashboardController.getSummary);
router.get(
  "/renovations",
  loginRequired,
  dashboardController.getRenovationsByPeriod
);
export default router;
