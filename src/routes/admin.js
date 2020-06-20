const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');
const recipes = require('../app/controllers/RecipeController');
const chefs = require('../app/controllers/ChefController');
const { adminRecipes } = require('../app/middlewares/validators/user');

routes.get("/recipes", adminRecipes, recipes.index);
routes.get("/recipes/create", recipes.create);
routes.get("/recipes/:id", recipes.show);
routes.get("/recipes/:id/edit", recipes.edit);
routes.post("/recipes", multer.array("photos", 5), recipes.post);
routes.put("/recipes", multer.array("photos", 5), recipes.put);
routes.delete("/recipes", recipes.delete);

routes.get("/chefs", chefs.index);
routes.get("/chefs/create", chefs.create);
routes.get("/chefs/:id", chefs.show);
routes.get("/chefs/:id/edit", chefs.edit);
routes.post("/chefs", multer.array("avatar", 1), chefs.post);
routes.put("/chefs", multer.array("avatar", 1), chefs.put);
routes.delete("/chefs", chefs.delete);

module.exports = routes;