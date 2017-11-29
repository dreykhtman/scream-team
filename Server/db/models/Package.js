let db = require('../_db');
let Sequelize = require('sequelize');

const Package = db.define('package', {
    name: {
        type: Sequelize.STRING
    }
})

module.exports = Package;