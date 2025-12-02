import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/register", authController.userRegistration);
router.post("/login", authController.login);

router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.ADMIN),
  authController.changePassword
);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  authController.getMe
);

export const authRoutes = router;
