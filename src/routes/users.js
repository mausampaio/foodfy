const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');

routes.get('/', UserController.list);

module.exports = routes;