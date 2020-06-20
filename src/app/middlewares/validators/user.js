const User = require('../../models/User');

async function onlyAdmin(req, res, next) {
    const results = await User.findById(req.session.userId);
    const user = results.rows[0];

    if (!user.is_admin) return res.render("admin/profile/index", {user});

    next();
};

module.exports = {
    onlyAdmin
};