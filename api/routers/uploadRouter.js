const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

router.post("/upload-request", async (req, res) => {
    
    const imgName = req.body;

    console.log(imgName)

    res.status(200).json({url: "This is your signed url"})
})

module.exports = router;