const User = require('../../models/User');
const Recipe = require('../../models/Recipe');
const RecipeController = require('../../../app/controllers/RecipeController');
const ChefController = require('../../../app/controllers/ChefController');
const ProfileController = require('../../../app/controllers/ProfileController');

async function onlyAdmin(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    if (!user.is_admin) return ProfileController.index(req, res);

    next();
};

async function adminRecipes(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    if (!user.is_admin) return RecipeController.restrictedIndex(req, res);

    next();
};

async function adminRecipesEdit(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});
    
    if (!user.is_admin) {
        const recipes = await Recipe.findAll({where: {user_id: user.id}});

        for (recipe of recipes) {
            if (req.params.id == recipe.id) {
                return next();
            };
        }

        return res.redirect(`/admin/recipes`);
    }

    next();
};

async function adminChefsIndex(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    next();
};

async function adminChefsShow(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    if (!user.is_admin) return ChefController.restrictedShow(req, res);

    next();
};

async function adminChefsEdit(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    const id = req.params.id;

    if (!user.is_admin) return res.redirect(`/admin/chefs/${id}`);

    next();
};

async function adminChefsCreate(req, res, next) {
    const user = await User.findOne({where: {id: req.session.userId}});

    req.user = user;

    if (!user.is_admin) return res.redirect(`/admin/chefs`);

    next();
};

module.exports = {
    onlyAdmin,
    adminRecipes,
    adminRecipesEdit,
    adminChefsShow,
    adminChefsIndex,
    adminChefsEdit,
    adminChefsCreate
};