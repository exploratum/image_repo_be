require('dotenv').config();
const pg = require("pg");

//uncomment the line below if you are working on a heroku server
pg.defaults.ssl = true;


module.exports = {

  development: {
    client: "pg",
    useNullAsDefault: true,

    connection: {
      host: process.env.POSTGRESS_DEV_HOST,
      port: process.env.POSTGRESS_DEV_PORT,
      user: process.env.POSTGRESS_DEV_USER,
      password: process.env.POSTGRESS_DEV_PASSWORD,
      database: process.env.POSTGRESS_DEV_DATABASE
    },

    migrations: {
      directory: "./database/development/migrations"
    },

    seeds: {
      directory: "./database/development/seeds"
    }
  },

  production: {
    client: 'pg',
    useNullAsDefault: true,

    connection: process.env.DATABASE_URL,
    pool: {min: 2, max: 10},
    migrations: {
      directory: "./database/development/migrations"
    },
    seeds: {
      directory: "./database/development/seeds"
    }
  }

};
