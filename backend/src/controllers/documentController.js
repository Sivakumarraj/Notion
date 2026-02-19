import crypto from "crypto";
import { Document } from "../models/Document.js";

function makeInviteToken() {
  return crypto.randomBytes(18).toString("base64url");
}

export const documentController = {
  async list(req, res) {
    const userId = req.user._id;
    const docs = await Document.find({
      $or: [{ owner: userId }, { "collaborators.user": userId }]
    }).select("title updatedAt owner collaborators version");

    return res.json(docs);
  },

  async create(req, res) {
    const { title = "Untitled", content = "" } = req.body;
    const doc = await Document.create({
      title,
      content,
      owner: req.user._id,
      collaborators: [{ user: req.user._id, role: "owner" }],
      versions: [{ snapshot: content, version: 1, createdBy: req.user._id }],
      activityLog: [{ user: req.user._id, action: "document_created", metadata: { title } }],
      inviteToken: makeInviteToken(),
      lastSavedAt: new Date()
    });

    return res.status(201).json(doc);
  },

  async get(req, res) {
    return res.json(req.document);
  },

  async share(req, res) {
    const { role = "viewer", email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email required" });
    }

    req.document.activityLog.push({
      user: req.user._id,
      action: "invite_sent",
      metadata: { email, role }
    });

    await req.document.save();
    return res.json({ inviteToken: req.document.inviteToken, role });
  },

  async joinByInvite(req, res) {
    const { token } = req.params;
    const { role = "viewer" } = req.body;

    const doc = await Document.findOne({ inviteToken: token });
    if (!doc) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const already = doc.collaborators.some((c) => c.user.toString() === req.user._id.toString());
    if (!already) {
      doc.collaborators.push({ user: req.user._id, role });
      doc.activityLog.push({
        user: req.user._id,
        action: "joined_via_invite",
        metadata: { role }
      });
      await doc.save();
    }

    return res.json({ documentId: doc._id });
  },

  async restoreVersion(req, res) {
    const { version } = req.params;
    const snapshot = req.document.versions.find((v) => v.version === Number(version));
    if (!snapshot) {
      return res.status(404).json({ message: "Version not found" });
    }

    req.document.content = snapshot.snapshot;
    req.document.version += 1;
    req.document.versions.push({
      snapshot: snapshot.snapshot,
      version: req.document.version,
      createdBy: req.user._id
    });
    req.document.activityLog.push({
      user: req.user._id,
      action: "version_restored",
      metadata: { fromVersion: Number(version), toVersion: req.document.version }
    });
    req.document.lastSavedAt = new Date();

    await req.document.save();
    return res.json(req.document);
  }
};
