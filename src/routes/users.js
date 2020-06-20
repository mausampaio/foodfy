const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');
const SessionController = require('../app/controllers/SessionController');
const User = require('../app/models/User');
const SessionValidator = require('../app/middlewares/validators/session');

routes.get('/login', SessionController.index);
routes.post('/login', SessionValidator.login, SessionController.login);
routes.post('/logout', SessionController.logout);

routes.get('/', UserController.list);
routes.get('/create', UserController.create);
routes.get('/:id/edit', UserController.edit);
routes.post('/', UserController.post);
routes.put('/', UserController.put);
routes.delete('/', UserController.delete);

module.exports = routes;