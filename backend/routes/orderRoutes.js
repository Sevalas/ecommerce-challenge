import express from "express";
import expressAsyncHandler from "express-async-handler";
import OrderModel from "../models/OrderModel.js";
import { isAuth } from "../utils/utils.js";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (request, response) => {
    try {
      const newOrder = new OrderModel({
        orderItems: request.body.orderItems.map((item) => ({
          ...item,
          product: item._id,
        })),
        shippingAddress: request.body.shippingAddress,
        paymentMethod: request.body.paymentMethod,
        itemsPrice: request.body.itemsPrice,
        shippingPrice: request.body.shippingPrice,
        taxPrice: request.body.taxPrice,
        totalPrice: request.body.totalPrice,
        user: request.user._id,
      });
      const order = await newOrder.save();
      response.status(201).send({ message: "New Order Created", order });
    } catch (error) {
      throw error;
    }
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ errorMessage: 'Order Not Found' });
    }
  })
);


export default orderRouter;
