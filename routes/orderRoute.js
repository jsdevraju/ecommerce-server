import express from "express";
import {
  deleteOrder,
  getAllOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/orderCtrl.js";
import { authUser, adminRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/order/new", authUser, newOrder);
router.get("/order/:id", authUser, getSingleOrder);
router.get("/my/order", authUser, myOrders);
router.get("/admin/orders", authUser, adminRole("admin"), getAllOrder);
router.put("/admin/order/:id", authUser, adminRole("admin"), updateOrder);
router.delete("/admin/order/:id", authUser, adminRole("admin"), deleteOrder);

export default router;
