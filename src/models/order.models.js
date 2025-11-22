import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
