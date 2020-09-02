const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

/*******************************************************************************************************/
/*               Provide presigned url allowing user to directly upload image to S3 bucket             */
/*******************************************************************************************************/

router.get("/request-upload-url", async (req, res) => {
    
    const imgName = req.query.imgName;

    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    const parameters = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imgName,
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
        res.status(500).json({error: "can not get upload url from aws"})
    }
    
})

module.exports = router;