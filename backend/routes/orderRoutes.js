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
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await OrderModel.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ errorMessage: "Order Not Found" });
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      order.status.isPaid = true;
      order.status.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.send({ message: "Order Paid", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

export default orderRouter;
