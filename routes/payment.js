const express = require('express');
const router = express.Router();
const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

const { 
    sendStripesKey,
    sendRazorPayKey,
    captureStripePayment,
    captureRazorpayPayment
} = require('../controllers/paymentController')

router.route('/stripeKey').get(isLoggedIn, sendStripesKey);
router.route('/razorpayKey').get(isLoggedIn, sendRazorPayKey);

router.route('/stripePayment').post(isLoggedIn, captureStripePayment);
router.route('/razorpayPayment').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;