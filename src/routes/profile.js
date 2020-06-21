const express = require('express');
const routes = express.Router();

const ProfileController = require('../app/controllers/ProfileController');
const { onlyAdmin } = require('../app/middlewares/validators/user');

routes.get('/', onlyAdmin, ProfileController.index);
routes.put('/', ProfileController.put);

module.exports = routes;