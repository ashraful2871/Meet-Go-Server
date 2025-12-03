import { Router } from "express";
import { authRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.routes";
import { eventRoutes } from "../modules/Event/event.route";
import { categoryRoutes } from "../modules/Category/category.routes";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
