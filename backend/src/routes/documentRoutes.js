import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { attachDocument } from "../middleware/documentAccess.js";
import { requireRole } from "../middleware/authMiddleware.js";

export const documentRoutes = Router();

documentRoutes.get("/", documentController.list);
documentRoutes.post("/", documentController.create);
documentRoutes.post("/join/:token", documentController.joinByInvite);

documentRoutes.get("/:id", attachDocument, documentController.get);
documentRoutes.post("/:id/share", attachDocument, requireRole(["owner", "editor"]), documentController.share);
documentRoutes.post("/:id/restore/:version", attachDocument, requireRole(["owner", "editor"]), documentController.restoreVersion);
