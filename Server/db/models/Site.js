let db = require('../_db');
let Sequelize = require('sequelize');

const Site = db.define('site', {
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    goalHrs: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    goalMins: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    type: {
        type: Sequelize.STRING
    }
});

module.exports = Site;
