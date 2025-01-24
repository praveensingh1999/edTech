const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60, // expire in 5 minutes
    }
});


//fxn to send emails for otp
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from edTech | Praveen ", otp);
        console.log("Email sent successfully:", mailResponse);
    } catch (error) {
        console.log("error occured in otp.js file:", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model('OTP', otpSchema);