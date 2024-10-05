

const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

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

module.exports = Review;
