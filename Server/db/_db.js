const Sequelize = require("sequelize")

//this will be replaced with config information upon deployment.
const _db = new Sequelize(process.env.DATABASE_URL || "postgres://localhost:5432/screamteam", {
    logging: false
})

module.exports = _db;