

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

    carId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Car",
        unique: false
    },
    rating: {
        type: Number,
        required: true
    },
    reviewText: {
        type: String
    },
    reviewdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: false 
    },
    createdAt: {
        type: Date,
        required: true
    }
})

const Review = mongoose.model("Review", ReviewSchema);

module.exports =  Review;
