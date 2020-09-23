const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const generateToken = require("../../auth/generateToken")

/****************************************************************************/
/*                     User logs in and receives Json Web Token             */
/****************************************************************************/

router.post("/", async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await userModel.findBy({username});
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user);
            res.status(200).json({"token": token})
        }
        else {
            res.status(401).json({"error": "Invalid credentials"})
        }
    }
    catch(err) {
        console.log(err)
        res.status(500).json({"error": "could not log you in"})
    }
})



module.exports = router;