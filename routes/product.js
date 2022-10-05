const express = require('express');
const {
    addProduct,
    getProducts,
    getProductsAdmin,
    getOneProduct,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForOneProduct
} = require('../controllers/productController');

const router = express.Router();
const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

router.route('/product').get(isLoggedIn, getProducts);
router.route('/product/:id').get(isLoggedIn, getOneProduct);

router.route('/review')
    .get(isLoggedIn, getOnlyReviewsForOneProduct)
    .put(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);

//Admin Route
router.route('/product').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/product').get(isLoggedIn, customRole('admin'), getProductsAdmin);
router.route('/admin/product/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);

module.exports = router;