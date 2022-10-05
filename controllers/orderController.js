const Order = require('../models/order')
const Product = require('../models/product')

const BigPromise = require('../middleware/bigPromise');
const CustomError = require('../utils/customError');

exports.createOrder = BigPromise(async  (req, res, next) => {
    const  {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body;


    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    })
});


exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(!order) {
        return next(new CustomError('Please check order id', 401));
    }
    res.status(200).json({
        success: true,
        order,
    });
})

exports.getloggedInOrders = BigPromise(async (req, res, next) => {
    const order = await Order.find({user: req.user._id});

    if(!order) {
        return next(new CustomError('No Orders available', 401));
    }
    res.status(200).json({
        success: true,
        order,
    });
})

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
    const order = await Order.find();

    res.status(200).json({
        success: true,
        order,
    });
})

exports.adminDeleteOrders = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(200).json({
        success: true,
        order,
    });
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    order.orderStatus = req.body.orderStatus;

    if(order.orderStatus == 'delivered') {
        return next(new CustomError('Order is already marked for delivered', 401))
    }

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product, prod.quntity);
    })
    
    await order.save();
    
    res.status(200).json({
        success: true,
        order,
    });
});

async function updateProductStock (productId, quntity) {
    const product  = await Product.findById(productId);

    product.stock = product.stock - quntity;

    await product.save({validateBeforeSave: false});
}