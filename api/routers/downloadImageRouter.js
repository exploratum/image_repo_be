'use strict'

const express = require('express')
const router = express.Router();
const imageModel =  require("../models/imageModel") 
const AWS = require('aws-sdk')

router.post("/", async (req, res) => {
    
    const images = req.body.data;
    console.log(images)

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


    Promise.allSettled(keyPromises)
        .then(results => {
            console.log("results from database checks: ", results)
            const imgsFound   = [];
            for (let result of results) {
                if (result.value) {
                    imgsFound.push(result.value.imgKey)
                }
            }
            console.log("found keys in database: ", imgsFound)

            //create array of non found images
            const imgsNotFound = images.filter(image => !imgsFound .includes(image))
            

            console.log(imgsNotFound)

            return [imgsFound, imgsNotFound]

        })
        //Request download urls
        .then(async newResults => {
            const [imgsFound, imgsNotFound] = newResults;

            const urls = [];
            const urlFailures = [];

            for (let imgKey of imgsFound) {
                const parameters = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: imgKey,
                    Expires: 3600,
                    ContentType: "image/jpeg"
                }
                console.log(parameters)
                
                const result = await new Promise((resolve, reject) => {
                    s3.getSignedUrl(parameters, (err, url) => {
                        if(err) {
                            reject({"imgKey": imgKey, "error": err});
                        }
                        else {
                            resolve({"imgKey":imgKey, "url": url});
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
            console.log("urls: ", urls)
            console.log("failures: ", urlFailures)

            //all request are successful
            if (imgsNotFound.length == 0 && urlFailures.length == 0) {
                res.status(200).json({data: urls})
            }
            //partial success or all failures
            else {
                res.status(207).json({data: createReport(imgsNotFound, urlFailures, imgsFound)})
            }

        })
})

/*******************************************************************************************************/
/*                 function to create report on all failed and successful upload requests              */
/*******************************************************************************************************/

function createReport(notFoundArr, urlFailedArr, successArr) {

    const report = [];
    for (let imgKey of urlFailedArr) {
        report.push({"error": "failed to get aws presigned url ", "img": imgKey})
    }
    for (let imgKey of notFoundArr) {
        report.push({"error": "There is already an image with this name", "img": imgKey})
    }
    for (let img of successArr) {
        report.push({"msg": "success", "image": img })
    }
    report.push({"metadata": {
        "aws failure(s)": urlFailedArr.length,
        "duplicates": notFoundArr.length,
        "nonDuplicates": successArr.length
    }})
}

module.exports = router;