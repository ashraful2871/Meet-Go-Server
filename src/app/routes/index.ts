import { Router } from "express";
import { authRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.routes";
import { eventRoutes } from "../modules/Event/event.route";
import { categoryRoutes } from "../modules/Category/category.routes";
import { eventParticipantRoutes } from "../modules/Event-Participant/eventParticipant.route";
import { reviewRoutes } from "../modules/Review/review.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/event",
    route: eventRoutes,
  },
  {
    path: "/category",
    route: categoryRoutes,
  },
  {
    path: "/event-participant",
    route: eventParticipantRoutes,
  },
  {
    path: "/review",
    route: reviewRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
