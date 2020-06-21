const express = require('express');
const routes = express.Router();

const main = require('./main');
const recipes = require('./recipes');
const chefs = require('./chefs');
const users = require('./users');
const profile = require('./profile');

routes.use("", main);
routes.use("/admin/recipes", recipes);
routes.use("/admin/chefs", chefs);
routes.use("/admin/users", users);
routes.use("/admin/profile", profile);

module.exports = routes;