const knex = require("knex");

const knexfile = require("../knexfile");

//DB_ENV needs to be setup in Heroku
const environment = process.env.DB_ENV || 'development';

module.exports = knex(knexfile[environment]);
