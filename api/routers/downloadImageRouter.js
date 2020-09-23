'use strict'

const express = require('express')
const router = express.Router();
const imageModel =  require("../models/imageModel") 
const AWS = require('aws-sdk')

/*******************************************************************************************************/
/*            Check if image exist in database                                                         */
/*            Respond with presigned url allowing user to directly download image from S3 bucket       */
/*******************************************************************************************************/
router.post("/", async (req, res) => {
    
    const images = req.body.data;

    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    //Check if images exist in database
    const  keyPromises= [];
    for (let image of images) {
        keyPromises.push(imageModel.findByImgKey(image.imgKey))
    }

    //Process all database checks attempts
    Promise.allSettled(keyPromises)
        .then(results => {

            const imgsFound   = [];

            //Store all images found in database
            for (let result of results) {
                if (result.value) {
                    imgsFound.push(result.value.imgKey)
                }
            }
            //Store all images not found in database
            const imgsNotFound = images.filter(image => !imgsFound.includes(image.imgKey))
            return [imgsFound, imgsNotFound]

        })
        .then(async newResults => {
            const [imgsFound, imgsNotFound] = newResults;

            const urls = [];
            const urlFailures = [];

            //Request presigned download urls
            for (let imgKey of imgsFound) {
                const parameters = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: imgKey,
                    Expires: 3600,
                }
                
                const result = await new Promise((resolve, reject) => {
                    s3.getSignedUrl('getObject', parameters, (err, url) => {
                        if(err) {
                            reject({"imgKey": imgKey, "error": err});
                        }
                        else {
                            resolve({"imgKey": imgKey, "url": url});
                        }
                    })
                })

                if (result.hasOwnProperty("url")) {
                    urls.push(result)
                }
                else {
                    urlFailures.push(result)
                }           
            }
            //all request are successful
            if (imgsNotFound.length == 0 && urlFailures.length == 0) {
                res.status(200).json({data: urls})
            }
            //partial success or all failures
            else {
                res.status(207).json({data: createReport(imgsNotFound, urlFailures, urls)})
            }

        })
})

/*******************************************************************************************************/
/*                 function to create report on all failed and successful upload requests              */
/*******************************************************************************************************/

function createReport(notFoundArr, urlFailedArr, successArr) {

    const report = [];
    for (let imgKey of urlFailedArr) {
        report.push({"error": "failed to get aws presigned url ", "imgKey": imgKey})
    }
    for (let img of notFoundArr) {
        report.push({"error": "image not found", "imgKey": img.imgKey})
    }
    for (let img of successArr) {
        report.push({"msg": "success", "imgKey": img.imgKey, "url": img.url })
    }
    report.push({"metadata": {
        "aws failure(s)": urlFailedArr.length,
        "not found": notFoundArr.length,
        "success": successArr.length
    }})

    return report
}

module.exports = router;