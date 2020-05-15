const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");


exports.index = function(req, res) {
    Recipe.highlights(function(recipes) {
        return res.render("main/index", {itens: recipes});
    });
};

exports.about = function(req, res) {
    return res.render("main/about");
};

exports.recipes = function(req, res) {
    let {filter, page, limit} = req.query;

    page = page || 1;
    limit = limit || 6;
    let offset = limit * (page -1);

    const params = {
        filter,
        page,
        limit,
        offset,
        callback(recipes) {
            if (Array.isArray(recipes) && recipes.length) {
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                };
    
                return res.render('main/recipes/recipes', {recipes, pagination, filter});
            } else {
                const result = 'Nenhum resultado foi encontrado...'
                const pagination = {
                    total: 0,
                    page
                };
    
                return res.render('main/recipes/recipes', {recipes, pagination, filter, result});
            };
        }
    };

    Recipe.paginate(params);

    // const {filter} = req.query || "%%";
    // Recipe.findBy(filter, function(recipes) {
    //     return res.render("main/recipes/recipes", {recipes, filter});
    // });
};

exports.chefs = function(req, res) {
    Chef.all(function(chefs) {
        return res.render("main/chefs/chefs", {chefs});
    });
};

exports.recipe = function(req, res) {
    Recipe.find(req.params.id, function(recipe) {
        if (!recipe) return res.send("Recipe not found!");

        recipe.created_at = date(recipe.created_at).format;

        return res.render("main/recipes/show", {recipe});
    });
};

exports.chef = function(req, res) {
    Chef.find(req.params.id, function(chef) {
        if (!chef) return res.send("Chef not found!");

        chef.created_at = date(chef.created_at).format;

        Recipe.findBy(req.params.id, function(recipes) {
            return res.render("main/chefs/show", {chef, recipes});
        });
    });
};