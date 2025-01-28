const OTP = require("../models/Otp");
const { User, Profile } = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// send otp
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from request body
        const { email } = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User Already registered',
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);


        //check unique otp or not
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });

        }
        const otpPayload = { email, otp };

        //create an entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfully
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })


    } catch (error) {
        console.log("error occured in Auth.js file", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }


};



//signup
exports.signUp = async (req, res) => {
    try {

        //data fetch from request body
        const { firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !contactNumber) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required',
            })
        }


        // validation check if password is equal to confirm password or not 
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and ConfirmPassword value  is not match ',
            })
        }

        //check user already exist or not

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            });
        }

        //findmost recent otp stored for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        // validate otp 
        if (recentOtp.length == 0) {
            //otp not found
            return res.status(400).json({
                success: false,
                message: 'otp not found'
            })
        }

        else if (otp !== recentOtp.otp) {
            //invalid otp
            return res.status(400).json({
                success: false,
                message: 'invalid otp',
            })
        }


        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in profile db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });


        //entry create in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,
        })

        //return res
        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered. Please try again',
        })

    }
}

//login
exports.login = async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;
        //validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required, please try again',
            });
        }

        //user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User is not registered , Please signup first',
            });
        }

        //generate jwt, after password maching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookies and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure , Please try again',
        });

    }
};

//change Password
exports.changePassword = async (req, res) => {
    // get data from req body
    const { oldPassword, newPassword, conformNewPassword } = req.body;

    // validation 
    if (!oldPassword || !newPassword || !conformNewPassword) {
        return res.status(401).json({
            success: false,
            message: 'Please provide details carefully',
        });
    };

    //validation if newPassword is not equal to currentPassword
    if (newPassword !== conformNewPassword) {
        return res.status(402).json({
            success: false,
            message: 'ConfirmNewPassword  is not match with NewPassword',
        });
    };

    //update password in database
    const user_id = req.user.id;
    const updatePassword = await User.findOneAndUpdate(user_id, {
        password: newPassword,
    })
    return res.status(200).json({
        success: true,
        message: 'Paasword Changed Successfully',
    });


    //send mail - password updated
    await mailSender(email, "Password Updated Successfully", "Password change successfully");
    //return response
    return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    });
}


