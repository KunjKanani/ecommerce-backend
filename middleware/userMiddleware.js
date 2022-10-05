const User = require('../models/user');
const BigPromise = require('../middleware/bigPromise')
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    let token = req.cookies.token;

    if(req.header("Authorization")) {
        token = req.header("Authorization").replace("Bearer ", "")
    }

    if (!token) {
        return next(new CustomError('Unauthorized Access', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
});


exports.customRole = (...roles)=> {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new CustomError('Unauthorize', 403));
        }
        next();
    }
}