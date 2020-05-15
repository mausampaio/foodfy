const {date} = require("../../lib/utils");
const Chef = require("../models/Chef");

exports.index = function(req, res) {
    Chef.all(function(chefs) {
        return res.render("admin/chefs/index", {chefs});
    });
};
exports.show = function(req, res) {
    Chef.find(req.params.id, function(chef) {
        if (!chef) return res.send("Chef not found!");
        
        chef.created_at = date(chef.created_at).format;

        Chef.findRecipes(req.params.id, function(recipes) {
            return res.render("admin/chefs/show", {chef, recipes});
        });
    });
};
exports.create = function(req, res) {
    return res.render("admin/chefs/create");
};
exports.post = function(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
        if (req.body[key] == "") {
            return res.send('Please, fill all the fields!');
        };
    };

    Chef.create(req.body, function(chef) {
        return res.redirect(`/admin/chefs/${chef.id}`);
    });
};
exports.edit = function(req, res) {
    Chef.find(req.params.id, function(chef) {
        if (!chef) return res.send("Chef not found!");

        chef.created_at = date(chef.created_at).format;

        return res.render("admin/chefs/edit", {chef});
    });
};
exports.put = function(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
        if (req.body[key] == "") {
            return res.send('Please, fill all the fields!');
        };
    };
    
    Chef.update(req.body, function() {
        return res.redirect(`chefs/${req.body.id}`);
    });
};
exports.delete = function(req, res) {
    Chef.delete(req.body.id, function() {
        return res.redirect(`/admin/chefs`);
    });
};