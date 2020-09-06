const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

const imageModel = require("../models/imageModel");

/*******************************************************************************************************/
/*                              Delete image information from database                                 */
/*                              then delete image from S3 bucket                                       */
/*******************************************************************************************************/


router.delete("/remove", async (req, res) => {
    
    const imgKey = req.body.imgKey;


    // Delete information from database
    try {
        const count = await imageModel.remove(imgKey);
        
        if (count == 0) {
            res.status(409).json({"error": `${imgKey} does not exist`});
        }
    }
    catch(err) {
        res.status(500).json({"error": "Can not delete image from database"});
    }

    //Delete image from S3
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    const parameters = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: req.body.imgKey,
    }

    try {
        del_response = await new Promise((resolve, reject) => {
            s3.deleteObject(parameters, (err, del_response) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                else {
                    resolve(del_response)
                }
            })
        })

        res.status(200).json({"success": "image was successfully deleted"})
    }

    catch {
        res.status(500).json({'error': "Could not delete image"})
    }

})

module.exports = router;