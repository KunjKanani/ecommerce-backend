const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name...'],
        maxLength: [50, 'Name should be under 40 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide a email...'],
        validate: [validator.isEmail, 'Invalide email...'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password...'],
        minlength: [6, 'Name should be under 6 characters'],
        select: false,
    },
    role: {
        type: String,
        default: 'user',
    },
    photo: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
    forgotPasswordToken: { type: String, },
    forgotPasswordExpiry: { type: Date, },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt Pass before save - HOOKS

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// Validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPass) {
    return await bcrypt.compare(userSendPass, this.password);
}

// Create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign(
        {
            id: this._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY,
        }
    );
}

// Generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
    const forgotToken = crypto.randomBytes(20).toString('hex');
    // Getting hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');

    //Time of token  
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgotToken;
}

module.exports = mongoose.model('User', userSchema);