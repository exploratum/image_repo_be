const jwt = require("jsonwebtoken");
const secrets = require("./secrets")


/****************************************************************************/
/*                       Token generator function                           */
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

module.exports = generateToken