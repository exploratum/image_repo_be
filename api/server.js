/*******************************************************************************************************/
/*                                        Import dependancies                                          */
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
/*                                            Import routers                                           */
/*******************************************************************************************************/
const uploadImageRouter = require("./routers/uploadImageRouter.js");
const downloadImageRouter = require("./routers/downloadImageRouter")
const getImageListRouter = require("./routers/getImageListRouter");
const removeImageRouter = require("./routers/removeImageRouter");
const registerRouter = require("./routers/registerRouter");
const loginRouter = require("./routers/loginRouter");

/*******************************************************************************************************/
/*                                        Connect routers to server                                    */
/*******************************************************************************************************/

server.use("/api/request-upload-url", uploadImageRouter);
server.use("/api/request-download-url", downloadImageRouter)
server.use("/api/list", getImageListRouter);
server.use("/api/remove", removeImageRouter);
server.use("/users/register", registerRouter);
server.use("/users/login", loginRouter);

/*******************************************************************************************************/
/*                                              Endpoint at root                                       */
/*******************************************************************************************************/

server.get('/', (req, res) => {
    res.status(200).send("Image Repository API");
})

/*******************************************************************************************************/
/*                                      Custom Middleware for logging                                  */
/*******************************************************************************************************/

function logger(req, res, next) {
    console.log(`Method ${req.method} requested at URL: ${req.url} on ${new Date().toISOString()}`);
    next();
}

module.exports = server;