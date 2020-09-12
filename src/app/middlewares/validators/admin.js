const User = require('../../models/User');
const UserController = require('../../controllers/UserController');

function onlyUsers(req, res, next) {
    if (!req.session.userId) return res.redirect("/admin/users/login");

    next();
};
async function isLogged(req, res, next) {
    if (req.session.userId) {
        const user = await User.findOne({where: {id: req.session.userId}});
        
        req.user = user;

        if (user.is_admin) {
            return UserController.edit(req, res);
        } else {
            return next();
        };
    };

    next();
}

module.exports = {
    onlyUsers,
    isLogged
};