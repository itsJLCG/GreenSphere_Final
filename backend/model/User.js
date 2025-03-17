const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("User", UserSchema);