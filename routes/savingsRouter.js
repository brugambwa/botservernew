var express = require('express');
var saveCtrl = require('../controllers/savingscontroller');

var saverouter = express.Router(); // eslint-disable-line new-cap

saverouter.route('/')
  /** GET /api/users - Get list of users */
  .get(saveCtrl.verifyWebHook)

  /** POST /api/users - Create new user */
  .post(saveCtrl.processRequest);


module.exports = saverouter;