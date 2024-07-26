const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        required: true
    }
})
UserSchema.index({'$**':'text'});

const User = mongoose.model("User", UserSchema);

module.exports =  User;
