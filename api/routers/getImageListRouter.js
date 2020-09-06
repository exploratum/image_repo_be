const express = require("express");
const router = express.Router();
const imageModel = require("../models/imageModel")


router.get("/list", async (req,res) => {
    try {
        const images = await imageModel.getAll();
        res.status(200).json({"images":images})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({"error":"Can not get image list from database,"});
    }
})

module.exports = router;