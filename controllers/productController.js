const BigPromise = require("../middleware/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require('cloudinary').v2

exports.addProduct = BigPromise(async (req, res, next) => {
    let imageArray = [];
    console.log(req.files);
    if (!req.files) {
        return next(new CustomError('Photos are required', 401));
    }

    for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
            folder: "products",
        });

        imageArray.push(
            {
                id: result.public_id,
                secure_url: result.secure_url,
            }
        );
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product,
    });
});

exports.getProducts = BigPromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalProduct = await Product.countDocuments();

    const productsObj = new WhereClause(Product.find(), req.query).search().filter();
    let products = await productsObj.base;

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    const filterdProductsCount = products.length;

    res.status(200).json({
        success: true,
        products,
        filterdProductsCount,
        totalProduct,
    });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('No Product Found', 401))
    }

    res.status(200).json({
        success: true,
        product,
    })
});

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };;
    const product = await Product.findById(productId);

    const alreadyReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (alreadyReview) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.comment = comment;
                rev.rating = Number(rating);
            }
        })
    } else {
        
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }

    //Adjust Rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // Save
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Review Added SuccessFully",
        review,
        ratings: product.ratings,
        numberOfReview: product.numberOfReviews,
    });

});


exports.deleteReview = BigPromise(async (req, res, next) => {
    const { productId } = req.query;

    const product = await Product.findById(productId);

    const newReviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    const numberOfReviews = newReviews.length;

    //Adjust Rating
    const ratings = newReviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // Update the product
    await Product.findByIdAndUpdate(
        productId,
        {
            reviews: newReviews,
            ratings,
            numberOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: "Review Deleted SuccessFully",
    });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
    console.log(req.query);
    const product = await Product.findById(req.query.productId);


    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
});

// NOTE: ADMIN ONLY CONTROLLER
exports.getProductsAdmin = BigPromise(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    let imagesArray = [];

    if (!product) {
        return next(new CustomError('No Product Found', 401))
    }

    if (req.files) {
        // Destory Existing images
        for (let index = 0; index < product.photos.length; index++) {
            cloudinary.uploader.destroy(product.photos[index].id);
        }
        //Upload new images

        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products",
            });

            imagesArray.push(
                {
                    id: result.public_id,
                    secure_url: result.secure_url,
                }
            );
        }
    }

    req.body.photos = imagesArray;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        product,
    })
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError("No Product Found with this id", 401));
    }

    for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.uploader.destroy(
            product.photos[index].id,
        )
    }


    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product Was Deleted.",
    });
});
