const express = require('express');
const routes = express.Router();

const main = require('./main');
const admin = require('./admin');

routes.use("", main);
routes.use("/admin", admin);

module.exports = routes;