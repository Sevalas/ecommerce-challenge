import express from "express";
import ProductModel from "../models/ProductModel.js";
import expressAsyncHandler from "express-async-handler";

const productRouter = express.Router();
const PAGE_SIZE = 3;

productRouter.get("/", async (request, response) => {
  const products = await ProductModel.find();
  response.send(products);
});

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
    response.status(404).send({
      errorMessage: `Product with the id ${request.params.id} not found`,
    });
  }
});

export default productRouter;
