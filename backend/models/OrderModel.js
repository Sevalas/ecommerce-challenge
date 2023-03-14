import mongoose from "mongoose";

const OrderModel = new mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      orderItems: [
        {
          slug: { type: String, required: true },
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          coverImage: { type: String, required: true },
          images: [String],
          price: { type: Number, required: true },
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
        },
      ],
      shippingAddress: {
        fullName: { type: String, required: true },
        address1: { type: String, required: true },
        address2: { type: String },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String },
        province: { type: String, required: true },
        country: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        location: {
          lat: Number,
          lng: Number,
          formatted_address: String,
          name: String,
          place_id: String,
          vicinity: String,
          searchedLocation: String,
          vicinity: String,
        },
      },
      paymentMethod: { type: String, required: true },
      itemsPrice: { type: Number, required: true },
      shippingPrice: { type: Number, required: true },
      taxPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
      },
      status: {
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
      },
    },
    {
      timestamps: true,
    }
  )
);

export default OrderModel;
