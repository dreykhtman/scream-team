let _db = require('./_db');

let Site = require('./models/Site');
let Package = require('./models/Package');

Package.belongsToMany(Site, { through: 'package_site' });
Site.belongsToMany(Package, { through: 'package_site' });

module.exports = {
    db: _db,
    Site,
    Package
};
