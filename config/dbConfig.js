const knex = require("knex");

const knexConfig = require("../knexfile");

//DB_ENV needs to be setup in Heroku
const environment = process.env.DB_ENV || 'development';

module.exports = knex(knexConfig[environment]);
