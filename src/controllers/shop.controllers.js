import mongoose from "mongoose";
import redis from "../db/redis.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";

import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";

const getProducts = AsyncHandler(async (req, res) => {
  const cacheKey = "products:all";

  const cacheData = await redis.get(cacheKey);

  if (cacheData) {
    const products = JSON.parse(cacheData);

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Found all iphones"));
  }

  const products = await Product.find();

  if (products.length > 0) {
    await redis.set(cacheKey, JSON.stringify(products), "EX", 60);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Found all iphones"));
});

const buyProduct = AsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;
  const purchasedUsersKey = `purchasedUsers:${productId}`;

  const isMember = await redis.sismember(purchasedUsersKey, userId);
  if (isMember === 1) {
    return res
      .status(400)
      .json(new ApiError(400, "You have already purchased this item."));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingOrder = await Order.findOne({ userId, productId }).session(
      session,
    );
    if (existingOrder) {
      await session.abortTransaction();
      session.endSession();
      await redis.sadd(purchasedUsersKey, userId);
      return res
        .status(400)
        .json(new ApiError(400, "You have already purchased this item."));
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

    await Promise.all([
      await redis.sadd(purchasedUsersKey, userId),
      await redis.del("products:all"),
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { order, remainingStock: product.stock },
          "iPhone purchased successfully!",
        ),
      );
  } catch (error) {
    await session.abortTransaction();

    if (
      error.errorLabels &&
      error.errorLabels.includes("TransientTransactionError")
    ) {
      return res
        .status(409)
        .json(new ApiError(409, "High Traffic: Please try again!"));
    }

    throw error;
  } finally {
    session.endSession();
  }
});

export { getProducts, buyProduct };
