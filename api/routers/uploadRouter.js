const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const imageModel = require("../models/imageModel");

/*******************************************************************************************************/
/*                Save image information to database                                                   */
/*                Respond with presigned url allowing user to directly upload image to S3 bucket       */
/*******************************************************************************************************/

router.post("/request-upload-url", async (req, res) => {
  
    const image = {
        imgKey: req.body.imgKey,
        category: req.body.category,
        owner: req.body.owner,
        description: req.body.description
    }


    // Save image information into database
    try {
        await imageModel.add(image);
    }
    catch(err) {
        if (err.message.includes("images_imgkey_unique")) {
            res.status(422).json("this filename already exist, please choose a different filename")
        }
        else {
            res.status(500).json({'error': "unable to save image information to database"})
        }
    }

    // Request pre signed url to AWS
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    const parameters = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: req.body.imgKey,
        Expires: 60,
        ContentType: "image/jpeg"
    }

    try {
        url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', parameters, (err, url) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                else {
                    resolve(url)
                }
            })
        })

        res.status(200).json({url: url})
    }

    catch {
        res.status(500).json({'error': "Did not receive upload url from aws"})
    }
    
})

module.exports = router;