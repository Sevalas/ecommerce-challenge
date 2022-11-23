import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/', express.static('../frontend/build')); // To run frontend production build

//Connect to mongoDB
dotenv.config();
let uri = process.env.MONGODB_URI;
uri = uri
  .replace("<user>", process.env.MONGODB_USER)
  .replace("<password>", process.env.MONGODB_PASSWORD);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to db");
  })
  .catch((error) => {
    console.log(error.message);
  });

app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

//Middleware
app.use((error, request, response, next) => {
  if (error) {
    console.log(error);
  }
  response.status(500).send({ errorMessage: error.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at port :${port}`);
});
