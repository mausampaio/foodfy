const express = require('express');
const routes = express.Router();

const chefs = require('../app/controllers/ChefController');
const multer = require('../app/middlewares/multer');
const { adminChefs, adminChefsEdit } = require('../app/middlewares/validators/user');
const { onlyUsers } = require('../app/middlewares/validators/admin');

routes.get("/", onlyUsers, chefs.index);
routes.get("/create", onlyUsers, chefs.create);
routes.get("/:id", onlyUsers, adminChefs, chefs.show);
routes.get("/:id/edit", onlyUsers, adminChefsEdit, chefs.edit);
routes.post("/", multer.array("avatar", 1), chefs.post);
routes.put("/", multer.array("avatar", 1), chefs.put);
routes.delete("/", chefs.delete);

module.exports = routes;