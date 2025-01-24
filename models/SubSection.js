const mongoose = require("mongoose");

const subsectionSchema = new mongoose.Schema({

    title: {
        type: String,
    },
    timeDuration: {
        type: String,
    },
    description: {
        type: String,
    },
    vedioUrl: {
        type: String,
    },

});

module.exports = mongoose.model('SubSection', subsectionSchema);