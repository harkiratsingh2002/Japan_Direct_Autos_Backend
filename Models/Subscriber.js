
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true
    } 
})

const Subscriber = mongoose.model("subscribe", subscriberSchema);

module.exports = Subscriber;
