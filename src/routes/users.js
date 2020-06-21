const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');
const SessionController = require('../app/controllers/SessionController');
const User = require('../app/models/User');
const SessionValidator = require('../app/middlewares/validators/session');
const { onlyAdmin } = require('../app/middlewares/validators/user');
const { onlyUsers ,isLogged } = require('../app/middlewares/validators/admin');

routes.get('/login', isLogged, SessionController.index);
routes.post('/login', SessionValidator.login, SessionController.login);
routes.post('/logout', SessionController.logout);

routes.get('/', onlyUsers, onlyAdmin, UserController.list);
routes.get('/create', onlyUsers, onlyAdmin, UserController.create);
routes.get('/:id/edit', onlyUsers, onlyAdmin, UserController.edit);
routes.post('/', UserController.post);
routes.put('/', UserController.put);
routes.delete('/', UserController.delete);

module.exports = routes;