import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/order_db`,
    );
    console.log(
      `MongoDB connected (Order Service) !! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
