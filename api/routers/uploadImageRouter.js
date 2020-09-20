'use strict'

const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const imageModel = require("../models/imageModel");
const restrict = require("../../auth/restrict-middleware")

/*******************************************************************************************************/
/*                Save image information to database                                                   */
/*                Respond with presigned url allowing user to directly upload image to S3 bucket       */
/*******************************************************************************************************/

router.post("/request-upload-url", restrict, async (req, res) => {

    const images = req.body.data;

    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    const uploadPromises = []


    //Add images to database and store results/promises in Array 
    for (let image of images) {
        uploadPromises.push(imageModel.add(image));
    }

    //Process all database upload promises
    Promise.allSettled(uploadPromises)
        .then(results => {

            const nonDuplicates = [];

            // Store all valid imgKeys
            for (let result of results) {
                if(result.status == 'fulfilled') {
                    let imgKey = result.value[0];
                    nonDuplicates.push(imgKey)
                }
            }

            // Store duplicate imgKeys that can not be added to database
            const duplicates = images
                .filter(image => !(nonDuplicates.includes(image['imgKey'])))
                .map(image => image['imgKey'])
                
            return([duplicates, nonDuplicates]);

        })
        // Get presigned urls for images successfully logged in database
        .then(async newResults => {

            const [duplicates, nonDuplicates] = newResults;

            const success = [];
            const failures = [];

            //request presigned urls for non duplicate imgKeys
            for (let imgKey of nonDuplicates)  {
                    const parameters = {
                                Bucket: process.env.S3_BUCKET_NAME,
                                Key: imgKey,
                                Expires: 3600,
                                ContentType: "image/jpeg"
                            }
                    const result = await new Promise((resolve, reject) => {
                        s3.getSignedUrl('putObject', parameters, (err, url) => {
                            if (err) {
                                reject({"imgKey": imgKey, "error":err})
                            }
                            else {
                                resolve({"imgKey": imgKey, "url": url})
                            }
                        })
                    })
        
                    if (result.hasOwnProperty("url")) {
                        success.push(result)
                    }
                    else {
                        failures.push(result)
                    }
            }
            //all request are successful
            if (duplicates.length == 0 && failures.length == 0) {
                res.status(200).json({data: success})
            }
            //partial success or all failures
            else {
                res.status(207).json({data: createReport(duplicates, failures, success)})
            }

        })

})

/*******************************************************************************************************/
/*                 function to create report on all failed and successful upload requests              */
/*******************************************************************************************************/

function createReport(duplicatesArr, awsFailedArr, successArr) {

    const report = [];
    for (let imgKey of awsFailedArr) {
        report.push({"error": "failed to get aws presigned url ", "img": imgKey})
    }
    for (let imgKey of duplicatesArr) {
        report.push({"error": "There is already an image with this name", "img": imgKey})
    }
    for (let img of successArr) {
        report.push({"msg": "success", "image": img })
    }
    report.push({"metadata": {
        "aws failure(s)": awsFailedArr.length,
        "duplicates": duplicatesArr.length,
        "nonDuplicates": successArr.length
    }})
    
    return report
}

module.exports = router;