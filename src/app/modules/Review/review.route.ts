import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { reviewController } from "./review.controller";
import { Router } from "express";

const router = Router();

router.post("/create", auth(UserRole.USER), reviewController.createReview);

export const reviewRoutes = router;
