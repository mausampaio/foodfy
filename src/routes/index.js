const express = require('express');
const routes = express.Router();

const main = require('./main');
const admin = require('./admin');
const users = require('./users');

routes.use("", main);
routes.use("/admin", admin);
routes.use("/admin/users", users);

module.exports = routes;