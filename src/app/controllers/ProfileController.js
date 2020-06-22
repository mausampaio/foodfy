const User = require('../models/User');
const { compare } = require('bcryptjs');

module.exports = {
    index(req, res) {
        const user = req.user;

        return res.render("admin/profile/index", {user});
    },
    async put(req, res) {
        try {
            console.log('entrou');
            
            const { email, password, name } = req.body;
            const id = req.session.userId;

            const data = {
                name,
                email,
                is_admin: false
            };

            const user = await User.findOne({where: {id}});

            const passed = await compare(password, user.password);

            if (!passed) return res.render("admin/profile/index", {
                user: req.body,
                error: "Senha incorreta"
            });

            await User.update(id, data);

            return res.render("admin/profile/index", {
                user: data,
                success: "Cadastro atualizado com sucesso."
            });
        } catch(err) {
            console.error(err);
            return res.render("admin/profile/index", {
                user: req.body,
                error: "Algum erro aconteceu!"
            });
        };
    }
};