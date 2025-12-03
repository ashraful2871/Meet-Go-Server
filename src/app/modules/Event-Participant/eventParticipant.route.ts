import { Router } from "express";
import auth from "../../middlewares/auth";
import { eventParticipantController } from "./eventParticipant.controller";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/join/:eventId",
  auth(UserRole.USER),
  eventParticipantController.joinEvent
);

router.patch(
  "/leave/:eventId",
  auth(UserRole.USER),
  eventParticipantController.leaveEvent
);

router.get(
  "/my-events",
  auth(UserRole.USER),
  eventParticipantController.getMyJoinedEvents
);

router.get(
  "/:eventId/participants",
  auth(UserRole.ADMIN, UserRole.HOST),
  eventParticipantController.getEventParticipants
);

export const eventParticipantRoutes = router;
