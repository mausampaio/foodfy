const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');
const User = require('../app/models/User');

routes.get('/', UserController.list);
routes.get('/create', UserController.create);
routes.get('/:id/edit', UserController.edit);
routes.post('/', UserController.post);
routes.put('/', UserController.put);

module.exports = routes;