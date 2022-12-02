import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import { generateToken, isAuth } from "../utils/utils.js";

const userRouter = express.Router();

userRouter.post(
  "/signin",
  expressAsyncHandler(async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email });
    if (user && bcrypt.compareSync(request.body.password, user.passwordHash)) {
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
        passwordHash: bcrypt.hashSync(request.body.password),
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

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (request, response) => {
    try {
      const user = await UserModel.findById(request.user._id);
      if (user) {
        user.name = request.body.name || user.name;
        user.email = request.body.email || user.email;
        if (bcrypt.compareSync(request.body.password, user.passwordHash)) {
          if (request.body.newPassword && request.body.newPassword != "") {
            console.log("cambio")
            user.passwordHash = bcrypt.hashSync(request.body.newPassword);
          }
          const upadatedUser = await user.save();
          response.send({
            _id: upadatedUser._id,
            name: upadatedUser.name,
            email: upadatedUser.email,
            isAdmin: upadatedUser.isAdmin,
            token: generateToken(upadatedUser),
          });
        } else {
          response.status(401).send({
            errorMessage: "Invalid password",
          });
        }
      } else {
        response.status(401).send({ errorMessage: "User not found" });
      }
    } catch (error) {
      throw error;
    }
  })
);

export default userRouter;
