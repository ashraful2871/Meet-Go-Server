import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.userRegistration);

export const authRoutes = router;
