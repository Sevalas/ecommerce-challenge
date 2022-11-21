import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import { generateToken } from "../utils/utils.js";

const userRouter = express.Router();

userRouter.post(
  "/signin",
  expressAsyncHandler(async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email });
    if (
      user &&
      bcrypt.compareSync(request.body.passwordHash, user.passwordHash)
    ) {
      response.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    }
    response.status(401).send({
      message: "Invalid email or password",
    });
  })
);

export default userRouter;
