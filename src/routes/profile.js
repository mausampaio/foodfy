const express = require('express');
const routes = express.Router();

const ProfileController = require('../app/controllers/ProfileController');
const { onlyAdmin } = require('../app/middlewares/validators/user');
const { onlyUsers } = require('../app/middlewares/validators/admin');

routes.get('/', onlyUsers, onlyAdmin, ProfileController.index);
routes.put('/', onlyUsers, ProfileController.put);

module.exports = routes;