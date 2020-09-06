/*******************************************************************************************************/
/*                                      Install dependancies                                           */
/*******************************************************************************************************/

const express = require('express');
const cors = require('cors');
const helmet = require("helmet")


/*******************************************************************************************************/
/*                                          Load dependancies                                          */
/*******************************************************************************************************/
const server = express();
server.use(express.json());
server.use(cors());
server.use(helmet());
server.use(logger);

/*******************************************************************************************************/
/*                                          Import routers                                             */
/*******************************************************************************************************/
const uploadRouter = require("./routers/uploadRouter.js")
const getImageListRouter = require("./routers/getImageListRouter")

/*******************************************************************************************************/
/*                                      Connect routers to server                                      */
/*******************************************************************************************************/

server.use("/api/routers/uploadRouter", uploadRouter);
server.use("/api/routers/getImageListRouter", getImageListRouter)


/*******************************************************************************************************/
/*                                              Endpoints                                              */
/*******************************************************************************************************/

server.get('/', (req, res) => {
    res.status(200).send("Image Repository API")
})

server.post("/request-upload-url", uploadRouter)

server.get("/list", getImageListRouter)



/*******************************************************************************************************/
/*                                      Custom Middleware for logging                                  */
/*******************************************************************************************************/

function logger(req, res, next) {
    console.log(`Method ${req.method} requested at URL: ${req.url} on ${new Date().toISOString()}`);
    next();
}

module.exports = server