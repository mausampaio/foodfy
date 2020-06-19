const User = require('../models/User');

module.exports = {
    async list(req, res) {
        const results = await User.all();
        const users = results.rows;

        return res.render("admin/user/list", {users});
    }
};