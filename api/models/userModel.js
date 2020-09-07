const db = require("../../config/dbConfig")

function register(user) {
    return db("users").insert(user, 'id')
}

function findBy(filter) {
    return db("users").where(filter).first();
}

module.exports = {
    register,
    findBy,
}