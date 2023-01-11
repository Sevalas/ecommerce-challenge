import express from "express";
import ProductModel from "../models/ProductModel.js";
import expressAsyncHandler from "express-async-handler";
import { isAuth, isAdmin } from "../utils/utils.js";

const productRouter = express.Router();
const PAGE_SIZE = 4;

productRouter.get(
  "/",
  expressAsyncHandler(async (request, response) => {
    const products = await ProductModel.find().sort({ createdAt: -1 });
    response.send(products);
  })
);

productRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const requestProduct = request.body;
    const newProduct = new ProductModel({
      name: requestProduct.name,
      slug: requestProduct.slug,
      image: requestProduct.image,
      brand: requestProduct.brand,
      category: requestProduct.category,
      description: requestProduct.description,
      price: requestProduct.price,
      countInStock: requestProduct.countInStock,
    });
    const product = await newProduct.save();
    response.send(product);
  })
);

productRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const product = await ProductModel.findById(request.params.id);
    if (product) {
      (product.name = request.body.name),
        (product.slug = request.body.slug),
        (product.image = request.body.image),
        (product.brand = request.body.brand),
        (product.category = request.body.category),
        (product.description = request.body.description),
        (product.price = request.body.price),
        (product.countInStock = request.body.countInStock);
      await product.save();
      response.send({ message: "Product Update" });
    } else {
      response.status(404).send({
        errorMessage: "Product not found",
      });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const product = await ProductModel.findById(request.params.id);
    if (product) {
      await product.remove();
      response.send({ message: "Product Deleted" });
    } else {
      response.status(404).send({
        errorMessage: "Product not found",
      });
    }
  })
);

productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (request, response) => {
    const productId = request.params.id;
    const product = await ProductModel.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.userId === request.user._id)) {
        return response
          .status(400)
          .send({ errorMessage: "You already submitted a review" });
      }
      const review = {
        userId: request.user._id,
        name: request.user.name,
        rating: Number(request.body.rating),
        comment: request.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      response.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      response.status(404).send({ errorMessage: "Product Not Found" });
    }
  })
);

productRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const { query } = request;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await ProductModel.countDocuments();

    response.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  "/categories",
  expressAsyncHandler(async (request, response) => {
    const categories = await ProductModel.find().distinct("category");
    response.send(categories);
  })
);

productRouter.get(
  "/search",
  expressAsyncHandler(async (request, response) => {
    const { query } = request;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            // 1-50
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};
    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };
    const products = await ProductModel.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await ProductModel.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    response.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  "/slug/:slug",
  expressAsyncHandler(async (request, response) => {
    const product = await ProductModel.findOne({ slug: request.params.slug });
    if (product) {
      response.send(product);
    } else {
      response.status(404).send({
        errorMessage: `Product with the slug ${request.params.slug} not found`,
      });
    }
  })
);

productRouter.get(
  "/:id",
  expressAsyncHandler(async (request, response) => {
    const product = await ProductModel.findById(request.params.id);
    if (product) {
      response.send(product);
    } else {
      response.status(404).send({
        errorMessage: `Product with the id ${request.params.id} not found`,
      });
    }
  })
);

export default productRouter;
