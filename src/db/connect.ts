import mongoose from "mongoose";
import "dotenv/config";
export const connection = async () => {
  try {
    console.log(process.env.DB_URL as string);

    await mongoose.connect(process.env.DB_URL as string);
  } catch (error) {
    console.log(error);
  }
};
