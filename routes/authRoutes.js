// External Import
import express from "express";
// Internal import
import {
  register,
  login,
  logout,
  verifyUserAccount,
  sendResetCode,
  verifyCode,
  changePassword,
} from "../controllers/authCtrl.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);
router.post("/reset-password", sendResetCode);
router.post("/verify-code", verifyCode);
router.post("/change-password", changePassword);
router.post("/verify", authUser, verifyUserAccount);

export default router;
