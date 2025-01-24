const mongoose = require("mongoose");
const Section = require("./Section");

const courseSchema = new mongoose.Schema({

    courseName: {
        type: String,
    },
    courseDescription: {
        types: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],
    ratingAndReveiws: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReveiw",
        }
    ],
    price: {
        type: Number,
    },
    thumbnail: {
        type: String,
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
});

module.exports = mongoose.model('Course', courseSchema);