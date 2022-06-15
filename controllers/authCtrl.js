import User from "../models/userSchema.js";
import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import { nanoid } from "nanoid";
import Code from "../models/resetSchema.js";

//Create a new User
export const register = catchAysncError(async (req, res, next) => {
  const { username, email, password } = req.body;
  //Generate email address verifyCode
  const emailVerifyCode = nanoid(6).toUpperCase();

  if (username.length < 4 || username.length > 10)
    return next(
      new ErrorHandler(
        "Username must be at least 4 characters or upto 10 characters",
        401
      )
    );

  const validateUsername = username.toLowerCase().replace(/ /g, "");

  if (password.length < 8 || password.length > 32)
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters or upto 32 characters",
        401
      )
    );

  const hasPassword = await bcrypt.hash(password, 12);

  //Send Verification Email
  sgMail.setApiKey(process.env.SENDGRID_SECRET);

  //Create Email Message Template
  const msg = {
    to: email,
    from: process.env.GMAIL_ID,
    subject: "Verify Your Account",
    text: "Do not share your verify reset code with anyone.",
    html: `<h1> Do not share your password reset code with anyone.</h1>
          <br>
          <center> <strong>${emailVerifyCode}</strong> </center/>
          `,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Verify Email Message Sent Success`);
    })
    .catch((err) => {
      console.log(`Verify Email Message Sent Failure: ${err}`);
    });

  const user = new User({
    username: validateUsername,
    email,
    password: hasPassword,
  });

  user.verifyCode = emailVerifyCode;

  await user.save();

  const {
    password: myPassword,
    verifyCode: myVerifyCode,
    ...userInfo
  } = user._doc;

  //generate a user token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  //Send data to client
  res
    .cookie("token", token, {
      httpOnly: true,
    })
    .status(201)
    .json({
      message: "Registers successfully",
      userInfo,
      token,
    });
});

//Verify User Account
export const verifyUserAccount = catchAysncError(async (req, res, next) => {
  const { email, verifyCode } = req.body;

  //Find User Account
  let code = await User.findOne({ email });
  if (!code) return next(new ErrorHandler("Invalid email address", 401));

  if (code.isVerified)
    return next(new ErrorHandler("You already have verify", 400));
  else if (!verifyCode) return next(new ErrorHandler("Invalid code", 400));
  else if (verifyCode !== code.verifyCode)
    return next(new ErrorHandler("Please enter valid code", 400));
  else if (verifyCode === code.verifyCode) {
    code.set({ isVerified: true });

    await code.save();
    //generate a user token
    const token = jwt.sign({ id: code._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // const newCode = await User.findOne({ email });

    const { password, ...userInfo } = code._doc;

    //Send data to client
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        message: "User Account Verify successfully",
        userInfo,
        token,
      });
  }
});

//Exits User Login
export const login = catchAysncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Invalid credentials", 401));

  // Compare Password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid credentials", 401));

  const { password: myPassword, verifyCode, ...userInfo } = user._doc;

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
    })
    .status(200)
    .json({
      message: "Login successful",
      userInfo,
      token,
    });
});

//Logout
export const logout = catchAysncError(async (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      message: "Logged Our Successfully",
      token: null,
      userInfo: null,
    });
});

//Send a reset code
export const sendResetCode = catchAysncError(async (req, res, next) => {
  const { email } = req.body;
  //Generate a Random Code
  const resetCode = nanoid(6).toUpperCase();

  const user = await User.findOne({ email });
  // Check user exits or not
  if (!user) {
    return next(new ErrorHandler("Credentials does not exist.", 404));
  } else {
    //send email
    sgMail.setApiKey(process.env.SENDGRID_SECRET);
    const msg = {
      to: email, // Change to your recipient
      from: process.env.GMAIL_ID, // Change to your verified sender
      subject: "Password reset code",
      text: "Do not share your password reset code with anyone.",
      html: `<h1> Do not share your password reset code with anyone.</h1>
          <br>
          <center> <strong>${resetCode}</strong> </center/>
          `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    const existingCode = await Code.findOne({ email }).select(
      "-__v -createdAt -updatedAt"
    );
    if (existingCode) {
      await Code.deleteOne({ email });
      const saveCode = await new Code({ resetCode, email });
      await saveCode.save();
    } else {
      const saveCode = await new Code({ resetCode, email });
      await saveCode.save();
    }
    res.json("Email sent!");
  }
});

//After reset code request verify code
export const verifyCode = catchAysncError(async (req, res, next) => {
  const { email, resetCode } = req.body;

  const code = await Code.findOne({ email });

  if(code === null) return next(new ErrorHandler("Invalid Email", 400))

  if (!code && code?.length === 0) {
    return next(
      new ErrorHandler("Invalid or expired reset code, Please try again.", 400)
    );
  } else if (await code.comparetoken(resetCode, code.resetCode)) {
    code.isVerified = true;
    await code.save();
    res.json({ message: "Change the password now." });
  } else {
    return next(
      new ErrorHandler("Invalid or expired reset code, Please try again.", 400)
    );
  }
});

// After Verify Code Change Password
export const changePassword = catchAysncError(async (req, res, next) => {
  const { email, password } = req.body;
  const verifyCode = await Code.findOne({ email });

  if (password?.length < 8)
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters or upto 32 characters",
        400
      )
    );

  if (!verifyCode || !verifyCode.isVerified) {
    return next(
      new ErrorHandler("Invalid or expired reset code, Please try again.", 400)
    );
  } else {
    const updatePass = await User.findOne({ email });

    const salt = bcrypt.genSaltSync(Number(process.env.SALT));
    const hashingPassword = bcrypt.hashSync(password, salt);

    updatePass.password = hashingPassword;

    await updatePass.save();

    await Code.deleteOne({ id: verifyCode._id });
    res.json({
      message: "Password Change Success. Please return and login again",
    });
  }
});
