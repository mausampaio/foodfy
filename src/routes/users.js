const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');

routes.get('/', UserController.list);
routes.get('/create', UserController.create);
routes.post('/', UserController.post)

module.exports = routes;