const db = require("../../config/dbConfig");

function getAll() {
    return db('images');
}

function add(image) {
    return db('images').insert(image,'id');
}

function remove(imgKey) {
    return db('images')
    .where({imgKey})
    .del();
}

module.exports = {
    add,
    getAll,
    remove,
}