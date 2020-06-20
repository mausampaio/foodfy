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
    }
};