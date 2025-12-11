import { UserRole } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import { dashboardController } from "./dashboardStats.controller";

const router = Router();

router.get(
  "/",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  dashboardController.getDashboardStatsSingle
);
export const dashboardStatsRoutes = router;
