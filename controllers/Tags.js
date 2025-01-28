const Tag = require("../models/Tags");

// create tag handler fxn

exports.createTag = async (req, res) => {
    try {
        //fetch data
        const { name, decription } = req.body;
        //validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        // create entry in db
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        })
        console.log(tagDetails);
        //return response
        return res.status(200).json({
            success: true,
            message: 'Tag created successfully',
        });

    } catch (error) {
        console.log("error occured in tag create controller", error);
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

// get all tags handler fxn
exports.showAlltags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: 'All data return successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })

    };
}