const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');
const recipes = require('../app/controllers/RecipeController');
const chefs = require('../app/controllers/ChefController');
const { adminRecipes, adminChefs, adminRecipesEdit, adminChefsEdit } = require('../app/middlewares/validators/user');
const { onlyUsers } = require('../app/middlewares/validators/admin');

routes.get("/recipes", onlyUsers, adminRecipes, recipes.index);
routes.get("/recipes/create", onlyUsers, recipes.create);
routes.get("/recipes/:id", onlyUsers, adminRecipesEdit, recipes.show);
routes.get("/recipes/:id/edit", onlyUsers, adminRecipesEdit, recipes.edit);
routes.post("/recipes", multer.array("photos", 5), recipes.post);
routes.put("/recipes", multer.array("photos", 5), recipes.put);
routes.delete("/recipes", recipes.delete);

routes.get("/chefs", onlyUsers, chefs.index);
routes.get("/chefs/create", onlyUsers, chefs.create);
routes.get("/chefs/:id", onlyUsers, adminChefs, chefs.show);
routes.get("/chefs/:id/edit", onlyUsers, adminChefsEdit, chefs.edit);
routes.post("/chefs", multer.array("avatar", 1), chefs.post);
routes.put("/chefs", multer.array("avatar", 1), chefs.put);
routes.delete("/chefs", chefs.delete);

module.exports = routes;