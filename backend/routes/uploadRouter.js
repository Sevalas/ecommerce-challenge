import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { isAuth, isAdmin } from "../utils/utils.js";
import expressAsyncHandler from "express-async-handler";

const uploadRouter = express.Router();
const upload = multer();

uploadRouter.post(
  "/",
  isAuth,
  isAdmin,
  upload.single("file"),
  expressAsyncHandler(async (request, response) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_APY_KEY,
      api_secret: process.env.CLOUDINARY_APY_SECRET,
    });
    const streamUpload = (streamRequest) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(streamRequest.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(request);
    response.send(result);
  })
);

export default uploadRouter;
