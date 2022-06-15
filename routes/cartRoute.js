import express from 'express'
import { addToCart, getToCart, removeToCart } from '../controllers/cartCtrl.js';
import { authUser } from '../middleware/auth.js';

const router = express.Router();


router.post("/cart/:id", authUser, addToCart)
router.get("/cart/all", authUser, getToCart)
router.delete("/cart/:id", authUser, removeToCart)

export default router;