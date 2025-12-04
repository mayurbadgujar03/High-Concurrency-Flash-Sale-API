import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DATABASE_URL, {
      maxPoolSize: 50,
    });
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Mongodb connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
