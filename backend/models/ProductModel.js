import mongoose from "mongoose";

const ProductModel = new mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      coverImage: { type: String, required: true },
      images: [String],
      brand: { type: String, required: true },
      category: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      countInStock: { type: Number, required: true },
      rating: { type: Number, required: true, default: 0 },
      numReviews: { type: Number, required: true, default: 0 },
    },
    {
      timestamps: true,
    }
  )
);

export default ProductModel;
