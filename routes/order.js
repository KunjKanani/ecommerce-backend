const express = require('express');

const { createOrder, getOneOrder, getloggedInOrders, adminGetAllOrders, adminUpdateOrder, adminDeleteOrders } = require('../controllers/orderController');
const router = express.Router();

const { isLoggedIn, customRole } = require('../middleware/userMiddleware')

router.route('/order/create/').post(isLoggedIn, createOrder);
router.route('/order/').get(isLoggedIn, getloggedInOrders);
router.route('/order/:id').get(isLoggedIn, getOneOrder);


//Admin Route
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), adminGetAllOrders);
router.route('/admin/order/:id')
.put(isLoggedIn, customRole('admin'), adminUpdateOrder)
.delete(isLoggedIn, customRole('admin'), adminDeleteOrders);

module.exports = router;