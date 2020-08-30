const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

/*******************************************************************************************************/
/*               Provide presigned url allowing user to directly upload image to S3 bucket             */
/*******************************************************************************************************/

router.get("/request-upload-url", async (req, res) => {
    
    const imgName = req.query.imgName;

    const s3 = new AWS.S3({
        region: 'us-west-1'
    })

    const parameters = {
        Bucket: process.env.BUCKET_NAME,
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
        console.log("An error happened")
        res.status(500).json({error: "can not get upload url"})
    }
    
})

module.exports = router;