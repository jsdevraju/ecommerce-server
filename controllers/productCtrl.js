import catchAysncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/productSchema.js";

export const createProduct = catchAysncError(async (req, res, next) => {
  const { title, price, description, category, qty, img } = req.body;

  if (title?.length < 6 || title?.length > 50)
    return next(
      new ErrorHandler(
        "Title atleast must be 4 characters or longer to 50 characters",
        400
      )
    );

  if (description?.length < 50)
    return next(
      new ErrorHandler("Description atleast must be 50 characters", 400)
    );

  const product = new Product({
    title,
    price,
    description,
    category,
    qty,
    img,
  });

  await product.save();

  res.status(201).json({
    message: "Create Product Successfully",
    product,
  });
});

export const getAllProduct = catchAysncError(async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const { category } = req.query;
  const { price } = req.query;
  const { search } = req.query;
  const newCategory = category?.toLowerCase();

  let queryStr = JSON.stringify(price);

  queryStr = queryStr?.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

  const startIndex = (page - 1) * limit;

  const productCount = await Product.where({
    category: { $regex: newCategory, $options: "$i" },
  }).count();

  console.log(search);

  const result = await Product.find({
    category: { $regex: newCategory, $options: "$i" },
    price: JSON.parse(queryStr),
    title: { $regex: search, $options: "$i" },
  })
    .limit(limit)
    .skip(startIndex)
    .exec();

  res.status(200).json({
    message: "Fetch All Data Successfully",
    result,
    productCount,
  });
});

export const getSingleProduct = catchAysncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    message: "Fetch Data Successfully",
    product,
  });
});

export const updateProduct = catchAysncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  await product.save();

  res.status(200).json({
    message: "Product Update Successfully",
    product,
  });
});

export const deleteProduct = catchAysncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  await product.remove();

  res.status(200).json({
    message: "Product Delete Successfully",
  });
});

export const createProductReview = catchAysncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const { _id, username } = req.user;


  const review = {
    user: _id,
    name:username,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === _id?.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === _id?.toString()) review.rating = rating;
      review.comment = comment;
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((review) => {
    avg += review.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Create Or Update Review",
  });
});

export const getProductReviews = catchAysncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);


  if (!product) return next(new ErrorHandler("Product Not Found", 404));


  res.status(200).json({
    message: "Successfully",
    reviews: product.reviews,
  });
});

export const deleteReview = catchAysncError(async(req, res, next) =>{
  const product = await Product.findById(req.query.productId);

  if(!product) return next(new ErrorHandler("Product Not Found", 404));

  const reviews = product.reviews.filter(rev => rev?._id.toString() != req.query.id.toString());

  if(reviews?.length === 0) return next(new ErrorHandler("Your are not author", 404));

  let avg = 0;
  reviews.forEach((review) => {
    avg += review.rating;
  });


 const ratings = avg / reviews?.length;

 const numOfReviews = reviews?.length;


  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    ratings,
    numOfReviews
  }, {
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  res.status(200).json({
    message:"Successfully",
  })

})