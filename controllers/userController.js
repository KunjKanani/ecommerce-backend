const User = require('../models/user');
const BigPromise = require('../middleware/bigPromise')
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/emailHelper');
const cloudinary = require('cloudinary').v2
const crypto = require('crypto');

exports.signUp = BigPromise(async (req, res, next) => {
    let userData;
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return next(new CustomError('Name, email and password is required', 400));
    }

    userData = {
        name,
        email,
        password
    }


    if (req.files) {
        let file = req.files.photo;
        let result = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'e-commerce',
                width: 150,
                crop: 'scale',
            },
        );
        userData['photo'] = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.create(
        userData,
    );

    cookieToken(user, res);
});


exports.signIn = BigPromise(async (req, res, next) => {
    const { email, password } = req.body;

    // Check for presents of email and password
    if (!email || !password) {
        return next(new CustomError('Please provide email and password', 400));
    }

    // Get user from DB
    const user = await User.findOne({
        email
    }).select("+password");

    // User not find in DB
    if (!user) {
        return next(new CustomError('You are not registed in app.', 400));
    }

    // Password checking
    const isPasswordCorrect = await user.isValidatedPassword(password);

    // Password wrong
    if (!isPasswordCorrect) {
        return next(new CustomError('email or password is not correct.', 400));
    }

    // SEND Success
    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logout Success"
    });
});

exports.forgorPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new CustomError('User Not Found', 400));
    }
    const forgotToken = user.getForgotPasswordToken();

    await user.save({ validateBeforeSave: false });

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    const message = `${myUrl}`;

    try {
        await mailHelper({
            email: user.email,
            subject: 'Reset your password',
            message: message
        });

        res.status(200).send({
            success: true,
            message: "Email Send successfully",
        });
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        user.save({ validateBeforeSave: false });
        return next(new CustomError(error.message, 500));
    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token  = req.params.token;

    console.log('kunj' + token);

    const encryptedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');


    const user = await User.findOne({
        encryptedToken,
        forgotPasswordExpiry: {
            $gt: Date.now(),
        },
    });

    if (!user) {
        return next(new CustomError('Token is invalid', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError('Password and confirm password not match', 400));
    }

    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    cookieToken(user, res);
});

exports.dashboard = BigPromise(async (req, res, next) => {
    cookieToken(req.user, res)
});

exports.changePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('password');

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword);

    if(!isCorrectOldPassword) {
        return next(new CustomError('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save();
    
    cookieToken(req.user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {

    const {email, name} = req.body;

    if(!email || !name) {
        next(new CustomError('Email and name required', 400));
    }
    const newData = {
        name: req.body.name,
        email: req.body.email,
    };

    if(req.files) {
        let file = req.files.photo;
        
        const user  = req.user;
        const imageId = user.photo.id;
        if(imageId) {
            await cloudinary.uploader.destroy(imageId);
        }

        let result = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'e-commerce',
                width: 150,
                crop: 'scale',
            },
        );
        newData['photo'] = {
            id: result.public_id,
            secure_url: result.secure_url
        }

    }

    const user = await User.findByIdAndUpdate(
        req.user.id, 
        newData, 
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    cookieToken(user, res);
});

exports.admin = BigPromise(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    });
});

exports.adminGetSingleUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        next(new CustomError('No User Found', 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
});

exports.adminUpdateUserDetails = BigPromise(async (req, res, next) => {

    const {email, name} = req.body;

    if(!email || !name) {
        next(new CustomError('Email and name required', 400));
    }
    
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    
    const user = await User.findByIdAndUpdate(
        req.params.id, 
        newData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    cookieToken(user, res);
});

exports.adminDeleteUserDetails = BigPromise(async (req, res, next) => {
    const user = await User.findByIdAndDelete(
        req.params.id, 
    );
    if(!user) {
        return next(new CustomError('User not found', 404));
    }
    if(user.photo) {
        await cloudinary.uploader.destroy(user.photo.id);
    }
    res.status(200).json({
        success: true,
        message: 'User Deleted Successfully.'
    });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find({role: 'user'});
    res.status(200).json({
        success: true,
        users,
    });
});