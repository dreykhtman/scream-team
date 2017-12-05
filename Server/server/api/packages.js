const express = require('express');
const router = express.Router();
const { db, Site, Package } = require('../../db');

router.get('/', async (req, res, next) => {
    try {
        let packages = await Package.findAll({
            include: [{ model: Site }]
        });
        res.json(packages);
    }
    catch (err) {
        next(err);
    }
})

router.get('/:id', async (req, res, next) => {
    let whereObj = {};
    if (req.query.isName) {
        whereObj.name = req.params.id;
    } else {
        whereObj.id = +req.params.id;
    }

    try {
        let package = await Package.findOne({
            where: whereObj,
            include: [{ model: Site }]
        });
        res.json(package);
    }
    catch (err) {
        next(err);
    }
})

module.exports = router;
