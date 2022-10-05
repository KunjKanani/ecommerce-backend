const express = require('express');
const router = express.Router();

const { signUp, signIn, logout, forgorPassword, passwordReset, dashboard, changePassword, updateUserDetails, admin, managerAllUser, adminGetSingleUser, adminUpdateUserDetails, adminDeleteUserDetails } = require('../controllers/userController');
const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

router.route('/signup').post(signUp);
router.route('/signin').post(signIn);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgorPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/dashboard').get(isLoggedIn, dashboard);
router.route('/changePassword').post(isLoggedIn, changePassword);
router.route('/dashboard/update').put(isLoggedIn, updateUserDetails);

// Admin only route
router.route('/admin/users').get(isLoggedIn, customRole('admin'), admin);
router.route('/admin/user/:id').get(isLoggedIn, customRole('admin'), adminGetSingleUser);
router.route('/admin/user/:id').put(isLoggedIn, customRole('admin'), adminUpdateUserDetails);
router.route('/admin/user/:id').delete(isLoggedIn, customRole('admin'), adminDeleteUserDetails);

// Manager only route
router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUser);

module.exports = router;