import Order from "../models/orderSchema.js";
import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/productSchema.js";

//Create New Order
export const newOrder = catchAysncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    message: "Create Order Successfully",
    order,
  });
});

//Get Single Order
export const getSingleOrder = catchAysncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "username email"
  );

  if (!order) return next(new ErrorHandler("Order not found ", 400));

  res.status(200).json({
    message: "Order Get Done",
    order,
  });
});

//Get logged in user Orders
export const myOrders = catchAysncError(async (req, res, next) => {
  const order = await Order.find({ user: req.user.id });

  res.status(200).json({
    message: "Order Get Done",
    order,
  });
});

//Get All Order -- Admin
export const getAllOrder = catchAysncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => (totalAmount += order.totalPrice));

  res.status(200).json({
    message: "Order Get Done",
    orders,
    totalAmount,
  });
});

//Update Order Status -- Admin
export const updateOrder = catchAysncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Product Not Found", 400));

  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler("You already delivered this product", 400));

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.qty);
  });

  order.orderStatus = req.body.status;
  if (order.orderStatus === "Delivered") order.deliveredAt = Date.now();

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Order Get Done",
    order,
  });
});

async function updateStock(id, qty) {
  const product = await Product.findById(id);

  product.qty -= qty;
  await product.save({ validateBeforeSave: false });
}

//Delete Order Status -- Admin
export const deleteOrder = catchAysncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Product Not Found", 400));

  await order.remove();

  res.status(200).json({
    message: "Order Delete Successfully",
  });
});
