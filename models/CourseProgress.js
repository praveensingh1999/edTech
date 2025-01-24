const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({

    couserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ],
});

module.exports = mongoose.model('CourseProgress', courseProgressSchema);