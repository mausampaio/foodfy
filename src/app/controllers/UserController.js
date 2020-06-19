const User = require('../models/User');

module.exports = {
    async list(req, res) {
        const results = await User.all();
        const users = results.rows;

        return res.render("admin/user/list", {users});
    },
    create(req, res) {
        return res.render("admin/user/create");
    },
    async post(req, res) {
        await User.create(req.body);

        return res.redirect('/admin/users');
    }
};