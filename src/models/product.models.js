import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
