import { Document } from "../models/Document.js";

export async function attachDocument(req, res, next) {
  const doc = await Document.findById(req.params.documentId || req.params.id);
  if (!doc) {
    return res.status(404).json({ message: "Document not found" });
  }

  const userId = req.user._id.toString();
  if (doc.owner.toString() === userId) {
    req.document = doc;
    req.documentRole = "owner";
    return next();
  }

  const collaborator = doc.collaborators.find((c) => c.user.toString() === userId);
  if (!collaborator) {
    return res.status(403).json({ message: "No access" });
  }

  req.document = doc;
  req.documentRole = collaborator.role;
  return next();
}
