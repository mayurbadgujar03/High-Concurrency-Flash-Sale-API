import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./src/models/product.models.js";
import { Order } from "./src/models/order.models.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to DB...");

    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("Old data cleaned.");

    const iphone = new Product({
      _id: "64c9e654e599a81832123456",
      name: "iPhone 15 Pro",
      stock: 1000,
    });

    await iphone.save();
    console.log("iPhone 15 Pro added with 1000 stock.");
    console.log(`Product ID: ${iphone._id}`);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
