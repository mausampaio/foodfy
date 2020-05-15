const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");

exports.index = function(req, res) {
    Recipe.all(function(recipes) {
        return res.render("admin/recipes/index", {recipes});
    });
};

exports.show = function(req, res) {
    Recipe.find(req.params.id, function(recipe) {
        if (!recipe) return res.send("Recipe not found!");

        recipe.created_at = date(recipe.created_at).format;

        return res.render("admin/recipes/show", {recipe});
    });
};

exports.create = function(req, res) {
    Recipe.chefSelectOptions(function(options) {
        const recipe = {
            ingredients: [""],
            preparation: [""]
        };
        
        return res.render("admin/recipes/create", {recipe, chefOptions: options});
    });
    
};

exports.post = function(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
        if (req.body[key] == "") {
            return res.send('Please, fill all the fields!');
        };
    };

    Recipe.create(req.body, function(recipe) {
        return res.redirect(`/admin/recipes/${recipe.id}`);
    });
};

exports.edit = function(req, res) {
    Recipe.find(req.params.id, function(recipe) {
        if (!recipe) return res.send("Recipe not found!");

        recipe.created_at = date(recipe.created_at).format;
        recipe.ingredients = recipe.ingredients || [""];
        recipe.preparation = recipe.preparation || [""];

        Recipe.chefSelectOptions(function(options) {
            return res.render("admin/recipes/edit", {recipe, chefOptions: options});
        });
    });
};

exports.put = function(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
        if (req.body[key] == "") {
            return res.send('Please, fill all the fields!');
        };
    };
    
    Recipe.update(req.body, function() {
        return res.redirect(`recipes/${req.body.id}`);
    });
};

exports.delete = function(req, res) {
    Recipe.delete(req.body.id, function() {
        return res.redirect(`/admin/recipes`);
    });
};