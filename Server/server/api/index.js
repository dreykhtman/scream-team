const express = require('express');
const router = express.Router(); 

router.use('/packages', require('./packages'));

module.exports = router;