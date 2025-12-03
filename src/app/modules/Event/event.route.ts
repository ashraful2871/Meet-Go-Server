import { Router } from "express";
import auth from "../../middlewares/auth";
import { eventController } from "./event.controller";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/create-event", auth(UserRole.HOST), eventController.createEvent);

export const eventRoutes = router;
