import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";

import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";
import mongoose from "mongoose";

const getProducts = AsyncHandler(async (req, res) => {
  const products = await Product.find();
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Found all iphones"));
});

const buyProduct = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  const existingOrder = await Order.findOne({ userId, productId }).session(session);
  if (existingOrder) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(new ApiError(400, "You have already purchased an iPhone."));
  }
  
  const product = await Product.findById(productId).session(session);
  if (!product) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(new ApiError(400, "Product not found."));
  }

  if (product.stock <= 0) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json(new ApiError(400, "Out of stock!"));
  }

  product.stock = product.stock - 1;
  await product.save({ session });

  const order = new Order({
    userId: userId,
    productId: productId,
  });
  await order.save({ session });

  await session.commitTransaction();
  session.endSession();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { order, remainingStock: product.stock },
        "iPhone purchased successfully!",
      ),
    );
});

export { getProducts, buyProduct };
