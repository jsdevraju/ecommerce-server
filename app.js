//External Import
import express from 'express';
import morgan from 'morgan';
import errorHandler from './middleware/error.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';

config()

//Define App Variables
const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Import Route
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoute.js';
import orderRoute from './routes/orderRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import cartRoute from './routes/cartRoute.js';

// Router Middleware
app.use('/api/v1', authRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', productRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', paymentRoute);
app.use('/api/v1', cartRoute);


// Error Middleware
app.use(errorHandler)

export default app;