import { Router } from "express";
import auth from "../../middlewares/auth";
import { eventController } from "./event.controller";
import { UserRole } from "@prisma/client";

const router = Router();

//
router.get("/", eventController.getAllEvents);
router.get(
  "/host-events",
  auth(UserRole.HOST),
  eventController.getAllHostEvents
);
router.post("/create-event", auth(UserRole.HOST), eventController.createEvent);
router.get("/:id", eventController.getSingleEvent);
router.patch("/:id", auth(UserRole.HOST), eventController.updateEvent);

router.delete("/:id", auth(UserRole.HOST), eventController.deleteEvent);
export const eventRoutes = router;
