import { Router } from "express";
import { categoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/create", auth(UserRole.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);

export const categoryRoutes = router;
