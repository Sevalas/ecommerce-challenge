import express from "express";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UserModel.js";
import data from "../dummy/data.js";

const seedRouter = express.Router();

seedRouter.get("/", async (request, response) => {
  await ProductModel.deleteMany({});
  const createdProducts = await ProductModel.insertMany(data.products);
  await UserModel.deleteMany({});
  const createdUsers = await UserModel.insertMany(data.users);
  response.send({ createdProducts, createdUsers });
});


export default seedRouter;
