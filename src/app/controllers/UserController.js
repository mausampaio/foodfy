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
            const totalRecipes = await Recipe.totalRecipesBy({where: {user_id: userId}});

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
                <table style="border-spacing: 0px; width: 586px; background-color: #ffffff; border: 1px solid #999999; height: 508px; margin: 0px auto; padding: 0px; font-size: 10pt;">
                    <tbody>
                        <tr style="height: 14px; border-color: #999; background-color: #a9a9a9;">
                            <td style="width: 60px; text-align: center;" colspan="3">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="width: 60px;">&nbsp;</td>
                            <td style="width: 20px; text-align: left; vertical-align: middle;">
                            <p>&nbsp;</p>
                            <p style="text-align: left; margin-top: 30px; margin-bottom: 30px;"><img src="https://raw.githubusercontent.com/mausampaio/foodfy/master/.github/logo.png"  /></p>
                            <p style="margin-top: 0px;"><strong>Parabéns, ${data.name}!</strong></p>
                            <p>O seu cadastro no Foodfy foi realizado com sucesso.</p>
                    
                            <p>Para realizar o acesso ao sistema basta utilizar os dados abaixo:</p>
                            <table style="height: 40px; margin-top: 30px;" width="511" cellspacing="0" cellpadding="0">
                                <tbody>
                                <tr>
                                    <td style="padding: 10px 0 10px 100px;">
                                    <p><strong>USUÁRIO</strong></p>
                                    </td>
                                    <td>
                                    <p>${data.email}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0 10px 100px; border-top: 1px solid #cccccc;">
                                    <p><strong>SENHA</strong></p>
                                    </td>
                                    <td style="border-top: 1px solid #cccccc;">
                                    <p>${randomstring}</p>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </td>
                            <td style="width: 53px; text-align: center;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-decoration: none; font-size: 9pt; border-top: 1px solid #cccccc; color: #999999; padding: 10px 0 10px 0;" colspan="3">
                            <p style="padding-left: 30px; margin: 0 0 2px 0;"><span style="color: #999999;"><span style="font-size: 12px;">Foodfy - O seu portal de receitas</span></span></p>
                            <p style="padding-left: 30px; margin: 0 0 2px 0;">https://tiziiu.com.br</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `
        });

        // <h2>Parabéns! O seu cadastro no Foodfy foi realizado com sucesso!</h2>
        //         <p>Para realizar o acesso ao sistema basta utilizar os dados abaixo:</p>
        //         <ul>
        //             <li>
        //                 Usuário: ${data.email}
        //             </li>
        //             <li>
        //                 Senha: ${randomstring}
        //             </li>
        //         </ul>

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

            const totalRecipes = await Recipe.totalRecipesBy({where: {user_id: id}});

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