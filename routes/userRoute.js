//External Import
import express from "express";
import { getUserInfo, updatePassword, updateUserProfile } from "../controllers/userCtrl.js";
import { authUser } from "../middleware/auth.js";

// Internal Import
const router = express.Router();

router.put("/update/me", authUser, updateUserProfile);
router.put("/password", authUser, updatePassword);
router.get("/profile/me", authUser, getUserInfo);

export default router;
