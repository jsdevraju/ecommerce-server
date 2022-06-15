import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

export const authUser = catchAysncError(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split("Bearer ")[1];

  if (!token)
    return next(
      new ErrorHandler("Invalid authorization token. please try again.", 400)
    );
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});

export const adminRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allow to this resource`,
          403
        )
      );
    }
    next()
  };
};
