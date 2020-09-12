"use strict"

const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

const imageModel = require("../models/imageModel");

/*******************************************************************************************************/
/*                              Delete image information from database                                 */
/*                              Delete image from S3 bucket                                            */
/*******************************************************************************************************/


router.delete("/remove", async (req, res) => {
    
    const imgKeys = req.body.imgKeys;

    const allPromisesArr = [];
    
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    //Run all asynchronous database delete functions and store results/promises in Array 
    for (let imgKey of imgKeys) {
        allPromisesArr.push(imageModel.remove(imgKey))
    }
 
    //Once settled process all database delete promises
    Promise.allSettled(allPromisesArr)

        .then(results => {

            const successfulPromisesArr = []
            const failedPromisesArr = []

            //Store all successful database deletes
            for (let result of results) {
                let img = result.value[0];
                if (result.status == 'fulfilled' && result.value.length == 1) {
                        successfulPromisesArr.push(img);
                }
            }

            //Store all unsuccessful database deletes
            for (let img of imgKeys) {
                if (!successfulPromisesArr.includes(img)) {
                    failedPromisesArr.push(img);
                }
            }

            return([successfulPromisesArr, failedPromisesArr])
        })

        .then(newResults => {

            const [successfulPromisesArr, failedPromisesArr] = newResults;
            const imgPromisesArr = [];

            //Run all asynchronous aws delete functions and store results/promises in Array 
            for (let img of successfulPromisesArr) {

                imgPromisesArr.push(new Promise((resolve, reject) => {
                    const parameters = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: img,
                    }
                    //AWS returns HTTP 204 and different header fields
                    s3.deleteObject(parameters, (err, response) => {
                        if (err) {
                            console.log(err)
                            reject({imgKey: img, error: err});
                        }
                        else {
                            resolve(img)
                        }
                    })
                }))
            }

            //Once settled process all aws delete promises
            Promise.allSettled(imgPromisesArr)
                .then(results => {

                    // Process cases where aws delete function failed
                    for (let result in results) {
                        if (result.status == "rejected") {
                            let img = Object.values(result)[0].imgKey
                            failedPromisesArr.push(img);
                            successfulPromisesArr.indexOf(img) > -1 ? successfulPromisesArr.splice(index,1) : false 
                        }
                    }
                    
                    // Process cases where all or some aws delete function were successful
                    if (failedPromisesArr.length == 0) {
                        res.status(200).json({"msg": "all requested deletions have been completed"});
                    }
                    else {
                        const report = createReport(successfulPromisesArr, failedPromisesArr);
                        res.status(207).json({"data": report})
                    }
                    
                })
        })

})
/*******************************************************************************************************/
/*                      function to create report on all failed and successful deletes                  */
/*******************************************************************************************************/

function createReport(successfulDeletes, failedDeletes) {

    const report = [];
    for (let img of failedDeletes) {
        report.push({"msg": "delete failure", "img": img})
    }
    for (let img of successfulDeletes) {
        report.push({"msg": "success", "img": img})
    }
    report.push({"metadata": {
        "failure(s)": failedDeletes.length,
        "success": successfulDeletes.length
    }})
    
    return report
}
            


module.exports = router;