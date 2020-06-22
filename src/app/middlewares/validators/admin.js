const User = require('../../models/User');
const ProfileController = require('../../controllers/ProfileController');

function onlyUsers(req, res, next) {
    if (!req.session.userId) return res.redirect("/admin/users/login");

    next();
};
async function isLogged(req, res, next) {
    if (req.session.userId) {
        const results = await User.totalRecipes(req.session.userId);
        const user = results.rows[0];
        
        req.user = user;

        if (user.is_admin) {
            return res.render(`admin/user/edit`, {user});
        } else {
            return next();
        };
    };
}

module.exports = {
    onlyUsers,
    isLogged
};