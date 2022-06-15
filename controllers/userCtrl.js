import User from "../models/userSchema.js";
import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Update User profile
export const updateUserProfile = catchAysncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  const { password, verifyCode, ...userInfo } = user._doc;

  //generate a user token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({
    message: "User profile updated",
    userInfo,
    token,
  });
});

// Update Password user profile
export const updatePassword = catchAysncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { oldPassword, newPassword } = req.body;

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatch)
    return next(new ErrorHandler("Old Password do not match", 400));

  if (oldPassword === newPassword)
    return next(new ErrorHandler("Please don't enter your old password", 400));

  if (newPassword.length < 8)
    return next(
      new ErrorHandler("Password must be at least 8 characters", 400)
    );

  const hashPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashPassword;

  await user.save();

  res.status(200).json({
    message: "Password Updated successfully",
  });
});

//Get User Info
export const getUserInfo = catchAysncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const { password, verifyCode, ...userInfo } = user._doc;

  res.status(200).json({
    message: "Successfully",
    userInfo,
  });
});
