import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, `Product title required`],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, `Product price required`],
    trim: true,
  },
  description: {
    type: String,
    required: [true, `Product description required`],
    trim: true,
  },
  category: {
    type: String,
    required: [true, `Product category required`],
    trim: true,
  },
  qty: {
    type: Number,
    default: 1,
  },
  img: [
    {
      image: {
        type: String,
        required: [true, `Product img required`],
        trim: true,
      },
    },
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name:{
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", productSchema);
