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
      errorMessage: "Invalid email or password",
    });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (request, response) => {
    try {
      const newUser = new UserModel({
        name: request.body.name,
        email: request.body.email,
        passwordHash: bcrypt.hashSync(request.body.passwordHash),
      });
      const user = await newUser.save();
      response.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } catch (error) {
      if (error.code == 11000) {
        response.status(401).send({
          errorMessage: "User already exist",
        });
      } else {
        throw error;
      }
    }
  })
);

export default userRouter;
