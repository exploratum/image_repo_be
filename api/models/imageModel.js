const db = require("../../config/dbConfig");

function getAll() {
    return db('images');
}

function findByImgKey(imgKey) {
    return db("images")
    .where({imgKey: imgKey})
    .select('imgKey')
    .first()
}

function add(image) {
    return db('images').insert(image,'imgKey');
}

function remove(imgKey) {
    return db('images')
    .where({imgKey})
    .del().
    returning('imgKey');
}

module.exports = {
    add,
    getAll,
    findByImgKey,
    remove,
}