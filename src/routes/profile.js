const express = require('express');
const routes = express.Router();

const ProfileController = require('../app/controllers/ProfileController');
const { onlyUsers, isLogged } = require('../app/middlewares/validators/admin');

routes.get('/', onlyUsers, isLogged, ProfileController.index);
routes.put('/', onlyUsers, ProfileController.put);

module.exports = routes;