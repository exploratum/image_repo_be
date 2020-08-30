const express = require('express');
const server = express();

server.use(express.json());

const cors = require('cors');
server.use(cors());

const helmet = require("helmet")
server.use(helmet());

server.use(logger);

server.get('/', (req, res) => {
    res.status(200).send("Image Repository API")
})



/**************************************/
/*      Custom Middleware             */
/**************************************/

function logger(req, res, next) {
    console.log(`Method ${req.method} requested at URL: ${req.url} on ${new Date().toISOString()}`);
    next();
}

module.exports = server