const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const restrict = require("../../auth/restrict-middleware")


router.post("/", restrict, async (req, res) => {
    
    const user = req.body;

    try {
        const hash = bcrypt.hashSync(user.password, 12);
        user.password = hash;

        const id = await userModel.register(user);
        res.status(201).json({"id": id});
    }
    catch(err) {
        console.log(err)
        res.status(500).json({"error": "Could not create new user", err})
    }
    
})


module.exports = router;