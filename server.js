const express = require('express');
const nunjucks = require('nunjucks');
const recipes = require("./data");

const server = express();

server.use(express.static('public'));

server.set("view engine", "njk");

nunjucks.configure("views", {
    express: server,
    autoescape: false,
    nocache: true
});

server.get("/", function(req, res) {
    return res.render("index", {itens: recipes});
});

server.get("/about", function(req, res) {
    return res.render("about");
});

server.get("/recipes", function(req, res) {
    return res.render("recipes", {itens: recipes});
});

server.listen(5000, function() {
    console.log("Console is runing");
});