const {date} = require("../../lib/utils");
const Chef = require("../models/Chef");
const Recipe = require("../models/Recipe");
const File = require("../models/File");

module.exports = {
    async index(req, res) {
        let results = await Chef.all();
        const chefs = results.rows;

        async function getAvatar(fileId) {
            results = await Chef.avatar(fileId);
            const avatar = results.rows[0];
        
            const avatarData = {
                ...avatar,
                src: `${req.protocol}://${req.headers.host}${avatar.path.replace("public", "")}`
            };

            return avatarData;
        };
        
        const chefsPromise = chefs.map(async chef => {
            if (chef.file_id != null) {
                chef.avatar = await getAvatar(chef.file_id);
            } else {
                chef.avatar = {src: "http://placehold.it/200x200?text=CHEF SEM FOTO"};
            };
            
            return chef;
        })

        const data = await Promise.all(chefsPromise);

        return res.render("admin/chefs/index", {chefs: data});
    },
    async show(req, res) {
        let results = await Chef.find(req.params.id);
        const chef = results.rows[0];

        if (!chef) return res.send("Chef not found!");

        chef.created_at = date(chef.created_at).format;

        results = await Chef.avatar(chef.file_id);
        const avatar = results.rows[0];

        let avatarData = {};

        if (avatar) {
            avatarData = {
                ...avatar,
                src: `${req.protocol}://${req.headers.host}${avatar.path.replace("public", "")}`
            };
        };

        if (Object.keys(avatarData).length == 0) {
            avatarData = null;
        };
        

        results = await Chef.findRecipes(req.params.id);
        const recipes = results.rows;

        let data = [];

        for (recipe of recipes) {
            results = await Recipe.files(recipe.id);
            let files = results.rows.map(file => ({
                ...file, 
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }));
            
            data.push({files: files[0], ...recipe});

            files = [];
        };  

        return res.render("admin/chefs/show", {chef, recipes: data, avatar: avatarData});
    },
    create(req, res) {
        return res.render("admin/chefs/create");
    },
    async post(req, res) {
        const keys = Object.keys(req.body);
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };
        
        let fileId = 0;

        const filesPromise = req.files.map(async file => {
            const results = await File.create({...file});
            fileId = results.rows[0].id;

            return
        });

        await Promise.all(filesPromise);

        const data = {
            ...req.body,
            file_id: fileId
        }

        const results = await Chef.create(data);
        const chefId = results.rows[0].id;
        
        return res.redirect(`/admin/chefs/${chefId}`);
    },
    async edit(req, res) {
        let results = await Chef.find(req.params.id);
        const chef = results.rows[0];

        if (!chef) return res.send("Chef not found!");
    
        chef.created_at = date(chef.created_at).format;

        results = await Chef.avatar(chef.file_id);
        const avatar = results.rows[0];

        let avatarData = {};

        if (avatar) {
            avatarData = {
                ...avatar,
                src: `${req.protocol}://${req.headers.host}${avatar.path.replace("public", "")}`
            };
        };

        if (Object.keys(avatarData).length == 0) {
            avatarData = null;
        };

        return res.render("admin/chefs/edit", {chef, avatar: avatarData});
    },
    async put(req, res) {
        const keys = Object.keys(req.body);
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };

        let fileId = 0;

        if (req.files.length != 0) {
            const newFilesPromise = req.files.map(async file => {
                const results = await File.create({...file});
                fileId = results.rows[0].id;

                return
            });

            await Promise.all(newFilesPromise);
        };

        if (req.body.removed_files) {
            const removedFiles = req.body.removed_files;

            console.log(removedFiles);
            
            await File.delete(removedFiles);
        };

        const data = {
            ...req.body,
            file_id: fileId
        }

        await Chef.update(data);
        
        return res.redirect(`chefs/${req.body.id}`);
    },
    async delete(req, res) {
        const results = await Chef.find(req.body.id);
        const chef = results.rows[0]; 

        await File.delete(chef.id);

        await Chef.delete(req.body.id);

        return res.redirect(`/admin/chefs`);
    }
};