import express from 'express';
import { processPayment } from '../controllers/paymentCtrl.js';
import { authUser } from '../middleware/auth.js';

const router = express.Router();

router.post("/payment/process", authUser, processPayment)

export default router;