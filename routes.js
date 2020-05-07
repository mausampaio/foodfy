const express = require('express');
const routes = express.Router();
const main = require('./controllers/main');
const admin = require('./controllers/admin');

routes.get("/", main.index);
routes.get("/about", main.about);
routes.get("/recipes", main.recipes);
routes.get("/recipes/:index", main.recipe);

routes.get("/admin/recipes", admin.index);
routes.get("/admin/recipes/create", admin.create);
routes.get("/admin/recipes/:index", admin.show);
routes.get("/admin/recipes/:index/edit", admin.edit);
routes.post("/admin/recipes", admin.post);
routes.put("/admin/recipes/:index", admin.put);
routes.delete("/admin/recipes/:index", admin.delete);

module.exports = routes;