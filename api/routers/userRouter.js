const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

router.post("/users/register", async (req, res) => {
    
    const user = req.body;

    try {
        const hash = bcrypt.hashSync(user.password, 12);
        user.password = hash;

        console.log(user)


        const id = await userModel.register(user );
        console.log("id: ", id);
        res.status(200).json({"id": id});
    }
    catch(err) {
        res.status(500).json({"error": "Could not create new user", err})
    }
    
})


module.exports = router;