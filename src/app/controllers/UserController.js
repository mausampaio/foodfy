const User = require('../models/User');

module.exports = {
    async list(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 6;
        let offset = limit * (page -1);

        const params = {
            page,
            limit,
            offset
        };

        const results = await User.paginate(params);
        const users = results.rows;

        const pagination = {
            total: Math.ceil(users[0].total / limit),
            page
        };

        return res.render("admin/user/list", {users, pagination});
    },
    create(req, res) {
        return res.render("admin/user/create");
    },
    async post(req, res) {
        await User.create(req.body);

        return res.redirect('/admin/users');
    }
};