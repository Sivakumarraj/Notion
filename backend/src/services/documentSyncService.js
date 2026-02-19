import { Document } from "../models/Document.js";

const pendingAutosave = new Map();

export function scheduleAutosave(documentId, payload, delayMs = 3000) {
  const previous = pendingAutosave.get(documentId);
  if (previous) {
    clearTimeout(previous);
  }

  const timeoutId = setTimeout(async () => {
    const { content, version, userId } = payload;
    const doc = await Document.findById(documentId);
    if (!doc) return;

    doc.content = content;
    doc.version = version;
    doc.lastSavedAt = new Date();
    doc.versions.push({ snapshot: content, version, createdBy: userId });
    doc.activityLog.push({ user: userId, action: "autosave", metadata: { version } });
    await doc.save();
    pendingAutosave.delete(documentId);
  }, delayMs);

  pendingAutosave.set(documentId, timeoutId);
}
