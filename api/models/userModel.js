const db = require("../../config/dbConfig")

function add(user) {
    console.log("!!!!!!!! In Model !!!!!!!!")
    return db("users").insert(user, 'id')
}

module.exports = {
    add,
}