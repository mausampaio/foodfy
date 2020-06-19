const express = require('express');
const routes = express.Router();
const main = require('../app/controllers/main');

routes.get("/", main.index);
routes.get("/about", main.about);
routes.get("/recipes", main.recipes);
routes.get("/chefs", main.chefs);
routes.get("/recipes/:id", main.recipe);
routes.get("/chefs/:id", main.chef);

module.exports = routes;