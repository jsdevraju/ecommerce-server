import Cart from '../models/cartSchema.js';
import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

export const addToCart = catchAysncError(async(req, res, next) =>{
    const { title, qty, price, description, product, user, img } = req.body;
    const cart = new Cart({
        title,
        qty,
        price,
        description,
        img,
        product:req.params.id,
        user:req.user?._id
    });

    await cart.save();

    res.status(201).json({
        message:"Successfully",
    })
})

export const getToCart = catchAysncError(async (req, res, next) =>{
    const cart = await Cart.find({user: req.user.id});

    res.status(200).json({
        message:"Successfully",
        cart
    })
})

export const removeToCart = catchAysncError(async(req, res, next) =>{
    const { id } = req.params;
    const cartItem = await Cart.findById(id);

    if(!cartItem) return next(new ErrorHandler("Not Found Product", 400))


    await cartItem.remove();

    res.status(200).json({
        message:"Remove Successfully",
    })
})