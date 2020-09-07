const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const secrets = require("../../config/secrets")

router.post("/users/login", async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await userModel.findBy({username});
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user);
            res.status(200).json({"message": `welcome ${user.username}`, "token": token})
        }
        else {
            res.status(401).json({"error": "Invalid credentials"})
        }
    }
    catch(err) {
        res.status(500).json({"error": "could not log you in"})
    }
})

/****************************************************************************/
/*                              Token generator                             */
/****************************************************************************/
function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username
    }

    const options = {
        expiresIn: '1d'
    };

    return jwt.sign(payload, secrets.jwtSecret, options)
}



module.exports = router;