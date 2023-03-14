import mongoose from "mongoose";

const ReviewModel = new mongoose.model(
  "Review",
  new mongoose.Schema(
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true },
    },
    {
      timestamps: true,
    }
  )
);

export default ReviewModel;
