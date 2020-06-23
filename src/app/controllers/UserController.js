const User = require('../models/User');
const { put } = require('../../routes/users');

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
    },
    async edit(req, res) {
        const id = req.params.id;

        const results = await User.totalRecipes(id);
        const user = results.rows[0];

        return res.render("admin/user/edit", {user});
    },
    async put(req, res) {
        try {
            let { id, name, email, is_admin } = req.body;

            console.log(req.body.is_admin);

            if (is_admin != "true") {
                is_admin = false;
            } else {
                is_admin = true;
            };

            const data = {
                name,
                email,
                is_admin
            };

            await User.update(id, data);

            const results = await User.totalRecipes(id);
            const totalRecipes = results.rows[0].total_recipes;

            return res.render("admin/user/edit", {
                user: {
                    ...data,
                    id: id,
                    total_recipes: totalRecipes
                },
                success: "Usuário atualizado com sucesso."
            });
        } catch(err) {
            console.error(err);
            return res.render("admin/user/edit", {
                user: req.body,
                error: "Algum erro aconteceu!"
            });
        };
    },
    async delete(req, res) {
        const id = req.body.id;

        await User.delete(id);

        return res.redirect('/admin/users');
    }
};