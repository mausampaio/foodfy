const crypto = require('crypto');
const { hash } = require('bcryptjs');
const User = require('../models/User');
const mailer = require('../../lib/mailer');


module.exports = {
    index(req, res) {
        return res.render("admin/session/login");
    },
    login(req, res) {
        req.session.userId = req.user.id;

        const user = req.user;

        if (user.is_admin == false) {
            return res.render("admin/profile/index", {user});
        } else {
            return res.redirect("/admin/users");
        };
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect("/");
    },
    forgotForm(req, res) {
        return res.render("admin/session/forgot-password");
    },
    async forgot(req, res) {
        try {
            const user = req.user;

            const token = crypto.randomBytes(20).toString("hex");

            let now = new Date();
            now = now.setHours(now.getHours() + 1);

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            });

            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Recuperção de senha',
                html: `
                    <table style="border-spacing: 0px; width: 586px; background-color: #ffffff; border: 1px solid #999999; height: 508px; margin: 0px auto; padding: 0px; font-size: 10pt;">
                        <tbody>
                            <tr style="height: 14px; border-color: #999; background-color: #a9a9a9;">
                                <td style="width: 60px; text-align: center;" colspan="3">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="width: 60px;">&nbsp;</td>
                                <td style="width: 500px; text-align: left; vertical-align: middle;">
                                <p>&nbsp;</p>
                                <p style="text-align: left; margin-top: 30px; margin-bottom: 30px;"><img src="https://raw.githubusercontent.com/mausampaio/foodfy/master/.github/logo.png"  /></p>
                                <p style="margin-top: 0px;"><strong>Esqueceu sua senha?</strong></p>
                                <p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
                        
                                <p>
                                    <a href="http://localhost:3000/admin/users/password-reset?token=${token}" target="_blank">
                                    RECUPERAR SENHA
                                    </a>
                                </p>
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

            // <h2>Esqueceu sua senha?</h2>
            //         <p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
            //         <p>
            //             <a href="http://localhost:3000/admin/users/password-reset?token=${token}" target="_blank">
            //                 RECUPERAR SENHA
            //             </a>
            //         </p>

            return res.render("admin/session/forgot-password", {
                success: "Um link de recuperação foi enviado para o e-mail cadastrado."
            });
        } catch(err) {
            console.error(err);
            return res.render("admin/session/forgot-password", {
                error: "Erro inesperado, tente novamente."
            });
        };
    },
    resetForm(req, res) {
        return res.render("admin/session/password-reset", {token: req.query.token});
    },
    async reset(req, res) {
        const { user } = req;
        const { password, token } = req.body;

        try {
            const newPassword = await hash(password, 8);

            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            });

            return res.render("admin/session/login", {
                user: req.body,
                success: "Senha atualizada com sucesso! Faça seu login."
            });
        } catch(err) {
            console.error(err);
            return res.render("admin/session/password-reset", {
                user: req.body,
                token,
                error: "Erro inesperado, tente novamente."
            });
        };
    }
};