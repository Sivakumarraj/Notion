import { Router } from "express";
import { createAuthController } from "../controllers/authController.js";

export function authRoutes({ jwtSecret }) {
  const router = Router();
  const controller = createAuthController({ jwtSecret });

  router.post("/register", controller.register);
  router.post("/login", controller.login);

  return router;
}
