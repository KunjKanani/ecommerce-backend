const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name...'],
        trim: true,
        maxLength: [120, 'Product name must be under 120 characters...']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price...'],
        maxLength: [5, 'Product price must be under 5 digit...']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description...'],        
    },
    photos: [
        {
            id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select product category from - shortSleeves, longSleeves, sweatShirt, hoodies'],
        enum: {
            values: [
                'shortSleeves',
                'longSleeves',
                'sweatShirt',
                'hoodies'
            ],
            message: 'Please select product category from - shortSleeves, longSleeves, sweatShirt, hoodies'
        }        
    },

    stock: {
        type: Number,
        required: [true, 'Please add stock for clothing'],
    },
    brand: {
        type: String,
        required: [true, 'Please add brand for clothing'],
    },

    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model('Product', productSchema);