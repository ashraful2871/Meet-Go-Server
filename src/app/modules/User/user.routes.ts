import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

//create Host
router.patch("/request-host", auth(UserRole.USER), userController.requestHost);

export const userRoutes = router;
