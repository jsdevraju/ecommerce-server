import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  title: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  img:{ type: String, required: true },
  product:{ type:mongoose.Types.ObjectId, required:true, ref:"Product" },
  user: { type:mongoose.Types.ObjectId, required:true, ref:"User" }
});

export default mongoose.model("Cart", cartSchema);
