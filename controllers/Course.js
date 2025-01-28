const Course = require("../models/Course");
const Tags = require("../models/Tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");



// handler fxn to create course

exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const { courseName, courseDescription, whatYouWillLeran, price, tag } = req.body;
        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLeran || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }
        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("instructor details: ", instructorDetails);

        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: 'Instructor details not found',
            });
        }
        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(400).json({
                success: false,
                message: 'Tag Details not found',
            });
        }


        //upload imageto cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLeran,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,

        })

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate({
            _id: instructorDetails._id
        },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {
                new: true
            },);

        //update the tag schema
        await Tags.findByIdAndUpdate({
            _id: instructorDetails._id
        },
            {
                $puh: {
                    tag: newCourse._id,
                }

            },
            {
                new: true,
            },);

        // return response
        return res.status(200).json({
            success: true,
            message: 'Course created Successfully',
            data: newCourse,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error occoured while creating a course ',
        });

    }
}




//handler fxn to get all courses

exports.showAllCourses = async (req, res) => {
    try {
        const allcourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReveiws: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
            data: allcourses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Can not fetch course data',
            error: error.message,
        })

    }
}