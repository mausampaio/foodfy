const User = require('../../models/User');

function onlyUsers(req, res, next) {
    if (!req.session.userId) return res.redirect("/admin/users/login");

    next();
};
async function isLogged(req, res, next) {
    if (req.session.userId) {
        const results = await User.totalRecipes(req.session.userId);
        const user = results.rows[0];

        if (user.is_admin) {
            return res.render(`admin/user/edit`, {user});
        } else {
            return res.redirect('/admin/profile');
        };
    };

    next();
}

module.exports = {
    onlyUsers,
    isLogged
};