const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subsection
exports.createSubSection = async (req, res) => {
    try {
        //fetch data from req body
        const { SectionId, title, timeDuration, description } = req.body;

        //extract file/vedio
        const vedio = req.file.vedioFile;
        //validation
        if (!SectionId || !title || !timeDuration || !description || !vedio) {
            return res.status(400).json({
                success: false,
                message: "requiyred all attribute please give all attribute",
            })
        }
        //upload vedio to clodinary
        const uploadDetails = await uploadImageToCloudinary(vedio, process.env.FOLDER_NAME);

        //CREATE a sub section
        const subsectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            vedioUrl: uploadDetails.secure_url,
        })
        //updated section with this sub section object id
        const updatedSection = await Section.findByIdAndUpdate({ _id: SectionId },
            {
                $push: {
                    subSection: subsectionDetails._id,
                }
            },
            { new: true }
        ).populate("subSection").exec();
        // return response
        return res.status(200).json({
            success: true,
            message: 'Sub Section created successfully',
            updatedSection,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occured while creating the sub section",
        })
    }
}

//update sub-section
exports.updatesubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { title, timeDuration, description, vedioUrl, subSectionId } = req.body;

        // data validation
        if (!title || !timeDuration || !description || !vedioUrl || !subSectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            });
        }
        //updated data
        const section = await SubSection.findByIdAndUpdate(subSectionId, { title, timeDuration, description, vedioUrl, }, { new: true });
        //return res
        return res.status(200).json({
            success: true,
            message: 'subSection updated successfully',
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to add subsection , please try again",
        })

    }
}

//delete section
exports.deletesubSection = async (req, res) => {
    try {
        //get id
        const { subSectionId } = req.body;
        //use findByIdand Delete
        await subSection.findByIdAndDelete(subSectionId);
        //return response
        return res.status(200).json({
            success: true,
            message: 'subSection deleted Successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete subsection',
        })

    }
}
