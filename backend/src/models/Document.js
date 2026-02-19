import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "editor", "viewer"], required: true }
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    snapshot: { type: String, required: true },
    version: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    version: { type: Number, default: 1 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: [collaboratorSchema],
    inviteToken: { type: String, index: true },
    versions: [versionSchema],
    activityLog: [activitySchema],
    lastSavedAt: { type: Date }
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, updatedAt: -1 });

export const Document = mongoose.model("Document", documentSchema);
