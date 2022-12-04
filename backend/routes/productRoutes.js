import express from "express";
import ProductModel from "../models/ProductModel.js";
import expressAsyncHandler from "express-async-handler";


const productRouter = express.Router();

productRouter.get("/", async (request, response) => {
  const products = await ProductModel.find();
  response.send(products);
});

productRouter.get("/categories", expressAsyncHandler(async (request, response) => {
  const categories = await ProductModel.find().distinct("category");
  response.send(categories);
}));

productRouter.get("/slug/:slug", async (request, response) => {
  const product = await ProductModel.findOne({ slug: request.params.slug });
  if (product) {
    response.send(product);
  } else {
    response.status(404).send({
      errorMessage: `Product with the slug ${request.params.slug} not found`,
    });
  }
});

productRouter.get("/id/:id", async (request, response) => {
  const product = await ProductModel.findById(request.params.id);
  if (product) {
    response.send(product);
  } else {
    response
      .status(404)
      .send({ errorMessage: `Product with the id ${request.params.id} not found` });
  }
});

export default productRouter;
