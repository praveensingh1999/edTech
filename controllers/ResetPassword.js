
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// reset password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const { email } = req.body;
        //check user from this email , email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Your email is not registered with us',
            });
        };

        //generate token
        const token = crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({ email: email },
            {
                token: token,
                resetPasswordExpires: Date().now() + 5 * 60 * 1000,
            },
            {
                new: true,
            }
        );

        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        //send mail containing the url
        await mailSender(email, "Password Reset Link", "Password Reset Link:", `Password Reset Link: ${url}`);
        //return response
        return res.status(200).json({
            success: true,
            message: 'Email send successfully, please check email and change password',
        });


    } catch (error) {
        console.log("error occured in reset password file", error);
        res.status(500).json({
            success: false,
            message: 'something went wrong while reset password',
        });
    };

}

// rest password
exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body;
        //validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password not match',
            });
        }

        //get userdetails from db using token
        const userDetails = await user.findOne({ token: token });

        // if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: 'Token is invalid',
            });
        }
        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            res.status(400).json({
                success: false,
                message: 'Token expired, please regenerate your token',
            })
        }
        //hash passaword
        const hashedPassword = await bcrypt.hash(password, 10);
        // password update
        await User.findByIdAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true },
        );
        // return response

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: 'Something went wrong while sending reset password',
        });
    }
}