import mongoose from "mongoose";

export async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  return mongoose.connection;
}
