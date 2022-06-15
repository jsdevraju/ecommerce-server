import catchAsyncError from '../middleware/catchAsyncError.js';
import Stripe from 'stripe';
import { config } from 'dotenv';

config()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);




export const processPayment = catchAsyncError(async(req, res, next) =>{
    console.log(req.body.amount)
    const payment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',
        setup_future_usage: 'off_session',
        payment_method_types: ['card'],
        statement_descriptor: 'Custom descriptor',
        metadata:{
            company:"Ecommerce"
        }
    })
    
    res.status(200).json({
        message:"successfully",
        client_secret:payment.client_secret
    })
})