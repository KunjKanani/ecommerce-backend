const BigPromise = require('../middleware/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const CustomError = require("../utils/customError");
var { nanoid } = require('nanoid');
const Razorpay = require('razorpay');

exports.sendStripesKey = BigPromise((req, res, next) => {
    res.status(200).json({
        stripeKey: process.env.STRIPE_KEY,
    });
})

exports.sendRazorPayKey = BigPromise((req, res, next) => {
    res.status(200).json({
        razorpayKey: process.env.REZORPAY_KEY,
    });
})

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntent.create({
        amount: req.body.amount,
        currency: 'inr',
        automatic_payment_methods: {enabled: true},
        //Optional
        metadata: {
            integration_check: 'accept_a_payment'
        }
    });

    if (!paymentIntent) {
        return next(new CustomError('Payment Failed', 401))
    }

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
    });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({ key_id: process.env.REZORPAY_KEY, key_secret: process.env.REZORPAY_SECRET });

    const order = await instance.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: nanoid(),
    })


    if (!order) {
        return next(new CustomError('Payment Failed', 401))
    }

    res.status(200).json({
        success: true,
        order,
    });
});