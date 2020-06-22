const express = require('express');
const routes = express.Router();

const chefs = require('../app/controllers/ChefController');
const multer = require('../app/middlewares/multer');
const { adminChefsIndex, adminChefsShow, adminChefsEdit, adminChefsCreate } = require('../app/middlewares/validators/user');
const { onlyUsers } = require('../app/middlewares/validators/admin');

routes.get("/", onlyUsers, adminChefsIndex, chefs.index);
routes.get("/create", onlyUsers, adminChefsCreate, chefs.create);
routes.get("/:id", onlyUsers, adminChefsShow, chefs.show);
routes.get("/:id/edit", onlyUsers, adminChefsEdit, chefs.edit);
routes.post("/", multer.array("avatar", 1), chefs.post);
routes.put("/", multer.array("avatar", 1), chefs.put);
routes.delete("/", chefs.delete);

module.exports = routes;