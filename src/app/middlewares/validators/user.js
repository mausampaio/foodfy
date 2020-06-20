const User = require('../../models/User');
const RecipesController = require('../../../app/controllers/RecipeController');

async function onlyAdmin(req, res, next) {
    const results = await User.findById(req.session.userId);
    const user = results.rows[0];

    if (!user.is_admin) return res.render("admin/profile/index", {user});

    next();
};

async function adminRecipes(req, res, next) {
    const results = await User.findById(req.session.userId);
    const user = results.rows[0];

    if (!user.is_admin) return RecipesController.restrictedIndex(req, res);

    next();
};

module.exports = {
    onlyAdmin,
    adminRecipes
};