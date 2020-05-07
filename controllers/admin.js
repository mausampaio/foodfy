const fs = require('fs');
const data = require("../data.json");

exports.index = function(req, res) {
    return res.render("admin/index", {itens: data.recipes});
};

exports.show = function(req, res) {
    const recipeIndex = req.params.index;
    const recipe = [data.recipes[recipeIndex]];
    return res.render("admin/show", {itens: recipe, index: recipeIndex});
};

exports.create = function(req, res) {
    return res.render("admin/create");
};

exports.post = function(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
        if (req.body[key] == "") {
            return res.send('Please, fill all the fields!');
        };
    };

    data.recipes.push({
        ...req.body
    });

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if (err) return res.send("Write file error!");
        return res.redirect(`/admin/recipes`);
    });
};

exports.edit = function(req, res) {
    const recipeIndex = req.params.index;
    const recipe = data.recipes[recipeIndex];

    if (recipe == null) {
        res.send("Member not found");
    };

    return res.render("admin/edit", {recipe: recipe, index: recipeIndex});
};

exports.put = function(req, res) {
    const recipeIndex = req.params.index;
    const foundRecipe = data.recipes[recipeIndex];

    if (foundRecipe == null) {
        res.send("Member not found");
    };

    const recipe = {
        ...foundRecipe,
        ...req.body
    };

    data.recipes[recipeIndex] = recipe;
    
    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if (err) return res.send("Write file error!");
        return res.redirect(`/admin/recipes`);
    });
};

exports.delete = function(req, res) {
    const recipeIndex = req.params.index;
    const foundRecipe = data.recipes[recipeIndex];

    const filteredMembers = data.recipes.filter(function(member, index) {
        return index != recipeIndex;
    });

    data.recipes = filteredMembers;

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if (err) return res.send("Write file error!");
        return res.redirect(`/admin/recipes`);
    });
};