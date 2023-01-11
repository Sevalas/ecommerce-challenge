import express from "express";
import expressAsyncHandler from "express-async-handler";
import OrderModel from "../models/OrderModel.js";
import UserModel from "../models/UserModel.js";
import ProductModel from "../models/ProductModel.js";
import {
  isAuth,
  isAdmin,
  sendGridMail,
  payOrderEmailTemplate,
} from "../utils/utils.js";

const orderRouter = express.Router();
const PAGE_SIZE = 4;

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

orderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const order = await OrderModel.findById(request.params.id);
    if (order) {
      await order.remove();
      response.send({ message: "Order Deleted" });
    } else {
      response.status(404).send({
        errorMessage: "Order not found",
      });
    }
  })
);

orderRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (request, response) => {
    const { query } = request;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const orders = await OrderModel.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countOrders = await OrderModel.countDocuments();

    response.send({
      orders,
      countOrders,
      page,
      pages: Math.ceil(countOrders / pageSize),
    });
  })
);

orderRouter.get(
  "/summary",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const orders = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const dailyOrders = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await ProductModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({
      users: users[0],
      orders: orders[0],
      dailyOrders,
      productCategories,
    });
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
  "/:id/deliver",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      order.status.isDelivered = true;
      order.status.deliveredAt = Date.now();
      await order.save();
      res.send({ message: "Order Delivered" });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "email name"
    );
    if (order) {
      if (order.status.isPaid != true) {
        order.status.isPaid = true;
        order.status.paidAt = Date.now();
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        };

        await sendGridMail({
          to: order.user.email,
          subject: `Ecom-svl New order ${order._id}`,
          html: payOrderEmailTemplate(order),
        });

        const updatedOrder = await order.save();
        res.send({ message: "Order Paid", order: updatedOrder });
      } else {
        res.status(404).send({ message: "Order Already Paid" });
      }
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

export default orderRouter;
