const recipes = require("../data");

exports.index = function(req, res) {
    return res.render("main/index", {itens: recipes});
};

exports.about = function(req, res) {
    return res.render("main/about");
};

exports.recipes = function(req, res) {
    return res.render("main/recipes", {itens: recipes});
};

exports.recipe = function(req, res) {
    const recipeIndex = req.params.index;
    const recipe = [recipes[recipeIndex]];
    return res.render("main/show", {itens: recipe});
};