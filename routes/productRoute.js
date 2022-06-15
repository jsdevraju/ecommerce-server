import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteReview,
  getAllProduct,
  getProductReviews,
  getSingleProduct,
  updateProduct,
} from "../controllers/productCtrl.js";
import { adminRole, authUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/admin/create/product", authUser, adminRole("admin"), createProduct);
router.put("/admin/product/:id", authUser, adminRole("admin"), updateProduct);
router.delete("/admin/product/:id", authUser, adminRole("admin"), deleteProduct);
router.get("/products", getAllProduct);
router.get("/product/:id", getSingleProduct);
router.put("/review", authUser, createProductReview);
router.get("/reviews", getProductReviews);
router.delete("/reviews", authUser, deleteReview);

export default router;
