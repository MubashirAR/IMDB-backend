var express = require('express');
// var router = express.Router();
let dbConnection = require('../lib/dbConnection').connect();

var moviesRouter = require('./movies');
var authRouter = require('./auth');
var express = require('express');
let router = express.Router();

router.use('/auth', authRouter);
router.use('/movie', moviesRouter);
/* GET home page. */
// router.get('/', function(req, res, next) {
//   console.log('route', req.session)
//   res.status(404).send({
//     msg: 'not found'
//   })
// });

module.exports = router;
