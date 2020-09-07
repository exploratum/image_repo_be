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
const uploadRouter = require("./routers/uploadImageRouter.js");
const getImageListRouter = require("./routers/getImageListRouter");
const removeImageRouter = require("./routers/removeImageRouter");
const userRouter = require("./routers/userRouter");
const loginRouter = require("./routers/loginRouter");

/*******************************************************************************************************/
/*                                        Connect routers to server                                    */
/*******************************************************************************************************/

server.use("/api/routers/uploadRouter", uploadRouter);
server.use("/api/routers/getImageListRouter", getImageListRouter);
server.use("/remove", removeImageRouter);
server.use("/users/register", userRouter);
server.use("users/login", loginRouter);

/*******************************************************************************************************/
/*                                              Endpoints                                              */
/*******************************************************************************************************/

server.get('/', (req, res) => {
    res.status(200).send("Image Repository API");
})

server.post("/request-upload-url", uploadRouter);
server.get("/list", getImageListRouter);
server.delete("/remove", removeImageRouter);
server.post("/users/register", userRouter);
server.post("/users/login", loginRouter);


/*******************************************************************************************************/
/*                                      Custom Middleware for logging                                  */
/*******************************************************************************************************/

function logger(req, res, next) {
    console.log(`Method ${req.method} requested at URL: ${req.url} on ${new Date().toISOString()}`);
    next();
}

module.exports = server;