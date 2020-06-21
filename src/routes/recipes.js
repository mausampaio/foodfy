const express = require('express');
const routes = express.Router();

const multer = require('../app/middlewares/multer');
const recipes = require('../app/controllers/RecipeController');
const { adminRecipes, adminRecipesEdit } = require('../app/middlewares/validators/user');
const { onlyUsers } = require('../app/middlewares/validators/admin');

routes.get("/", onlyUsers, adminRecipes, recipes.index);
routes.get("/create", onlyUsers, recipes.create);
routes.get("/:id", onlyUsers, adminRecipesEdit, recipes.show);
routes.get("/:id/edit", onlyUsers, adminRecipesEdit, recipes.edit);
routes.post("/", multer.array("photos", 5), recipes.post);
routes.put("/", multer.array("photos", 5), recipes.put);
routes.delete("/", recipes.delete);

module.exports = routes;