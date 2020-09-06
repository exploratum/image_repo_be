const db = require("../../config/dbConfig");

function getAll() {
    console.log("*********in Model!!***********")
    return db('images')
}

function add(image) {
    console.log("**********in model !!**********")
    return db('images').insert(image,'id')
}

module.exports = {
    add,
    getAll,
}