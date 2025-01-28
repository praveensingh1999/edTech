const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        //get data
        const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;
        //get user id
        const userid = req.user.id;
        // validation
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All field are required",
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profileDetails,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: 'error occured while updating the profile',
        })

    }
}


// delete account
exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: 'user not found',
            });
        }
        //delete profile

        const deleteprofile = await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // delete this user from enrolled courses if entrolled <<---------------------------------------

        // delete user details
        const userdata = await User.findByIdAndDelete({ _id: id });
        //return response
        return res.status(200).json({
            success: true,
            message: "Deleted account successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "anable to delete account",
        })
    }
}


// get user details 
exports.getUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionDetails").exec();
        //return response
        return res.status(200).json({
            success: true,
            message: 'user data fetched successfully',
        }

        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'error occured while geting user details',
        })

    }
}