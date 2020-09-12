const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { hash } = require('bcryptjs');
const mailer = require('../../lib/mailer');

module.exports = {
    async list(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 6;
        let offset = limit * (page -1);

        const params = {
            limit,
            offset
        };

        const users = await User.paginate(params);

        async function getTotalRecipes(userId) {
            const results = await User.totalRecipes(userId);
            const totalRecipes = results.rows[0].total_recipes;

            return totalRecipes;
        };

        const usersPromise = users.map(async user => {
            user.total_recipes = await getTotalRecipes(user.id);

            return user;
        });

        const data = await Promise.all(usersPromise);

        const pagination = {
            total: Math.ceil(users[0].total / limit),
            page
        };

        return res.render("admin/user/list", {users: data, pagination});
    },
    create(req, res) {
        return res.render("admin/user/create");
    },
    async post(req, res) {
        const randomstring = Math.random().toString(36).slice(-8);
            
        const passwordHash = await hash(randomstring, 8);

        let isAdmin = false;

        if (req.body.is_admin != "true") {
            isAdmin = false;
        } else {
            isAdmin = true;
        };

        const data = {
            name: req.body.name,
            email: req.body.email,
            password: passwordHash,
            is_admin: isAdmin
        };

        await User.create(data);

        await mailer.sendMail({
            to: data.email,
            from: 'no-reply@foodfy.com.br',
            subject: 'Bem-vindo ao Foodfy!',
            html: `
                <h2>Parabéns! O seu cadastro no Foodfy foi realizado com sucesso!</h2>
                <p>Para realizar o acesso ao sistema basta utilizar os dados abaixo:</p>
                <ul>
                    <li>
                        Usuário: ${data.email}
                    </li>
                    <li>
                        Senha: ${randomstring}
                    </li>
                </ul>
            `
        });

        return res.redirect('/admin/users');
    },
    async edit(req, res) {
        req.user.total_recipes = await Recipe.totalRecipesBy({where: {user_id: req.user.id}});

        return res.render("admin/user/edit", {user: req.user});
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