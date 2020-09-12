"use strict"

const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

const imageModel = require("../models/imageModel");

/*******************************************************************************************************/
/*                              Delete image information from database                                 */
/*                              then delete image from S3 bucket                                       */
/*******************************************************************************************************/


router.delete("/remove", async (req, res) => {
    
    const imgKeys = req.body.imgKeys;
    console.log(imgKeys);

    const allPromisesArr = [];
    const successfulPromisesArr = []
    const failedPromisesArr = []

    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
    })

    //Delete images in database asynchronously
    for (let imgKey of imgKeys) {
        console.log({"imgKey": imgKey})
        allPromisesArr.push(imageModel.remove(imgKey))
    }
 

    Promise.allSettled(allPromisesArr)
        .then(results => {
            for (let result of results) {
                let img = result.value[0];
                if (result.status == 'fulfilled' && result.value.length == 1) {
                        successfulPromisesArr.push(img);
                }
            }

            //Any image not in the successfulPromiseArr should be pushed to the failedPromiseArr
            for (let img of imgKeys) {
                if (!successfulPromisesArr.includes(img)) {
                    failedPromisesArr.push(img);
                }
            }
            console.log('all attempts: ', results);
            console.log('successfulPromisesArr: ', successfulPromisesArr);
            console.log('failedPromisesArr: ', failedPromisesArr);


            
            
            const imgPromisesArr = [];

            for (let img of successfulPromisesArr) {
                imgPromisesArr.push(new Promise((resolve, reject) => {
                    const parameters = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: img,
                    }

                    //response returns HTTP 204 and different header fields
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


            Promise.allSettled(imgPromisesArr)
                .then(results => {

                    console.log("***************************************")
                    console.log("all images sent to aws for delete: ", results);

                    for (let result in results) {
                        if (result.status == "rejected") {
                            let img = Object.values(result)[0].imgKey
                            failedPromisesArr.push(img);
                            successfulPromisesArr.indexOf(img) > -1 ? successfulPromisesArr.splice(index,1) : false 
                        }
                    }
                    

                    if (failedPromisesArr.length == 0) {
                        res.status(200).json({"msg": "all requested deletions have been completed"});
                    }
                    else {
                        const report = [];
                        for (let failed of failedPromisesArr) {
                            report.push({"msg": "delete failure", "img": failed})
                        }
                        for (let success of successfulPromisesArr) {
                            report.push({"msg": "success", "img": success})
                        }
                        report.push({"metadata": {
                            "failure(s)": failedPromisesArr.length,
                            "success": successfulPromisesArr.length
                        }})
                        console.log('all succeeded database deletes: ', successfulPromisesArr);
                        console.log('all failed database deletes: ', successfulPromisesArr);
                        console.log("report: ", report)
                        res.status(207).json({"data": report})
                    }
                    
                })
        }
    )


/////////////////////////////////////////////////////////////


    // // Delete information from database
    // try {
    //     const count = await imageModel.remove(imgKey);
        
    //     if (count == 0) {
    //         res.status(409).json({"error": `${imgKey} does not exist`});
    //     }
    // }
    // catch(err) {
    //     console.log(err)
    //     res.status(500).json({"error": "Can not delete image from database"});
    // }

    // //Delete image from S3
    // const s3 = new AWS.S3({
    //     accessKeyId: process.env.S3_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    //     region: process.env.S3_REGION
    // })

    // const parameters = {
    //     Bucket: process.env.S3_BUCKET_NAME,
    //     Key: req.body.imgKey,
    // }

    // try {
    //     del_response = await new Promise((resolve, reject) => {
    //         s3.deleteObject(parameters, (err, del_response) => {
    //             if (err) {
    //                 console.log(err)
    //                 reject(err)
    //             }
    //             else {
    //                 resolve(del_response)
    //             }
    //         })
    //     })

    //     res.status(200).json({"message": "image was successfully deleted"})
    // }

    // catch(err) {
    //     console.log(err)
    //     res.status(500).json({'error': "Could not delete image"})
    // }

})

module.exports = router;