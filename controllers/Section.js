const Section = require("../models/Section");
const Course = require("../models/Course");

// create section
exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body;
        // data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing Properties',
            });
        }

        // create section
        const newSection = await Section.create({ sectionName });
        // update course with section ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            { new: true },
        ).populate("section").populate("subsection").exec();
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section created Successfully',
            data: updatedCourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in section creation ,Please try again'
        });

    }
}


//update section
exports.updateSection = async (req, res) => {
    try {
        // fetch data from req body
        const { sectionName, SectionId } = req.body;

        // data validation
        if (!sectionName || !SectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            });
        }
        //updated data
        const section = await Section.findByIdAndUpdate(SectionId, { sectionName }, { new: true });
        //return res
        return res.status(200).json({
            success: true,
            message: 'Section updated successfully',
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to add section , please try again",
        })

    }
}

//delete section
exports.deleteSection = async (req, res) => {
    try {
        //get id
        const { SectionId } = req.body;
        //use findByIdand Delete
        await Section.findByIdAndDelete(SectionId);
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted Successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete section',
        })

    }
}
