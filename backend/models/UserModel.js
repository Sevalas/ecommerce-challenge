import mongoose from "mongoose";

const UserModel = new mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      isAdmin: { type: Boolean, default: false, required: true },
    },
    {
      timestamps: true,
    }
  )
);

export default UserModel;
