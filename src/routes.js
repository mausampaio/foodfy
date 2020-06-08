const express = require('express');
const routes = express.Router();
const multer = require('./app/middlewares/multer');
const main = require('./app/controllers/main');
const recipes = require('./app/controllers/recipes');
const chefs = require('./app/controllers/chefs');

routes.get("/", main.index);
routes.get("/about", main.about);
routes.get("/recipes", main.recipes);
routes.get("/chefs", main.chefs);
routes.get("/recipes/:id", main.recipe);
routes.get("/chefs/:id", main.chef);

routes.get("/admin/recipes", recipes.index);
routes.get("/admin/recipes/create", recipes.create);
routes.get("/admin/recipes/:id", recipes.show);
routes.get("/admin/recipes/:id/edit", recipes.edit);
routes.post("/admin/recipes", multer.array("photos", 5), recipes.post);
routes.put("/admin/recipes", multer.array("photos", 5), recipes.put);
routes.delete("/admin/recipes", recipes.delete);

routes.get("/admin/chefs", chefs.index);
routes.get("/admin/chefs/create", chefs.create);
routes.get("/admin/chefs/:id", chefs.show);
routes.get("/admin/chefs/:id/edit", chefs.edit);
routes.post("/admin/chefs", multer.array("avatar", 1), chefs.post);
routes.put("/admin/chefs", multer.array("avatar", 1), chefs.put);
routes.delete("/admin/chefs", chefs.delete);





module.exports = routes;