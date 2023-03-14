import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import {
  generateToken,
  isAuth,
  isAdmin,
  sendGridMail,
  baseUrl,
} from "../utils/utils.js";
import jwt from "jsonwebtoken";

const userRouter = express.Router();
const PAGE_SIZE = 4;

userRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const { query } = request;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countUsers = await UserModel.countDocuments();

    response.send({
      users,
      countUsers,
      page,
      pages: Math.ceil(countUsers / pageSize),
    });
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const user = await UserModel.findById(request.params.id);
    if (user) {
      user.name = request.body.name || user.name;
      user.email = request.body.email || user.email;
      user.isAdmin = request.body.isAdmin
        ? Boolean(request.body.isAdmin)
        : user.isAdmin;
      await user.save();
      response.send({ message: "User Updated" });
    } else {
      response.status(404).send({
        errorMessage: "User not found",
      });
    }
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const user = await UserModel.findById(request.params.id);
    if (user) {
      await user.remove();
      response.send({ message: "User Deleted" });
    } else {
      response.status(404).send({
        errorMessage: "User not found",
      });
    }
  })
);

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

userRouter.post(
  "/forget-password",
  expressAsyncHandler(async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email });

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });
      user.resetToken = token;
      await user.save();

      await sendGridMail({
        to: user.email,
        subject: `Reset Password`,
        html: ` 
        <p>Please Click the following link to reset your password:</p> 
        <a href="${baseUrl()}/reset-password/${token}"}>Reset Password</a>
        `,
      });

      response.send({ message: "We sent reset password link to your email." });
    } else {
      response.status(404).send({ errorMessage: "User not found" });
    }
  })
);

userRouter.post(
  "/reset-password",
  expressAsyncHandler(async (request, response) => {
    jwt.verify(
      request.body.token,
      process.env.JWT_SECRET,
      async (err) => {
        if (err) {
          response.status(401).send({ message: "Invalid Token" });
        } else {
          const user = await UserModel.findOne({ resetToken: request.body.token });
          if (user) {
            if (request.body.password) {
              user.passwordHash = bcrypt.hashSync(request.body.password);
              await user.save();
              response.send({
                message: "Password reseted successfully",
              });
            }
          } else {
            response.status(404).send({ errorMessage: "User not found" });
          }
        }
      }
    );
  })
);

export default userRouter;
