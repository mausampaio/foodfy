module.exports = {
    index(req, res) {
        return res.render("admin/session/login");
    },
    login(req, res) {
        req.session.userId = req.user.id;

        return res.redirect("/admin/users");
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect("/");
    }
};