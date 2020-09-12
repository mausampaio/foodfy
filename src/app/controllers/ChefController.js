const {date} = require("../../lib/utils");
const fs = require('fs');
const Chef = require("../models/Chef");
const Recipe = require("../models/Recipe");
const File = require("../models/File");

module.exports = {
    async index(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 8;
        let offset = limit * (page -1);

        const params = {
            limit,
            offset
        };

        const chefs = await Chef.paginate(params);

        const pagination = {
            total: Math.ceil(chefs[0].total / limit),
            page
        };

        async function getAvatar(fileId) {
            const avatar = await File.findOne({where: {id: fileId}});
            
            let avatarData = {};

            if (avatar) {
                avatarData = {
                    ...avatar,
                    src: `${req.protocol}://${req.headers.host}${avatar.path.replace("public", "")}`
                };
            }

            if (Object.keys(avatarData).length == 0) {
                avatarData = {src: "http://placehold.it/200x200?text=CHEF SEM FOTO"};
            };

            return avatarData;
        };
        
        const chefsPromise = chefs.map(async chef => {
            if (chef.file_id != null) {
                chef.avatar = await getAvatar(chef.file_id);
            } else {
                chef.avatar = {src: "http://placehold.it/200x200?text=CHEF SEM FOTO"};
            };

            chef.total_recipes = await Recipe.totalRecipesBy({where: {chef_id: chef.id}});
            
            return chef;
        })

        const data = await Promise.all(chefsPromise);

        return res.render("admin/chefs/index", {chefs: data, pagination, user: req.user});
    },
    async show(req, res) {
        const chef = await Chef.findOne({where: {id: req.params.id}});

        chef.total_recipes = await Recipe.totalRecipesBy({where: {chef_id: chef.id}});

        if (!chef) return res.send("Chef not found!");

        chef.created_at = date(chef.created_at).format;

        const avatar = await File.findOne({where: {id: chef.file_id}});

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
        

        const recipes = await Recipe.findAll({where: {chef_id: req.params.id}});

        async function getFiles(recipeId) {
            
            let files = await Recipe.files(recipeId);
            files = files.map(file => ({
                ...file, 
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }));

            return files[0];
        }

        const recipesPromise = recipes.map(async recipe => {
            const chef = await Chef.findOne({where: {id: recipe.chef_id}});

            recipe.chef_name = chef.name;

            recipe.files = await getFiles(recipe.id);

            return recipe;
        });

        const data = await Promise.all(recipesPromise); 

        return res.render("admin/chefs/show", {chef, recipes: data, avatar: avatarData, user: req.user});
    },
    async restrictedShow(req, res) {
        const chef = await Chef.findOne({where: {id: req.params.id}});

        results = await Chef.findByUser(req.params.id, req.user.id);
        
        if (results.rows[0] == undefined) {
            chef.total_recipes = 0;
        } else {
            chef.total_recipes = results.rows[0].total_recipes;
        };

        if (!chef) return res.send("Chef not found!");

        chef.created_at = date(chef.created_at).format;

        const avatar = await File.findOne({where: {id: chef.file_id}});

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
        

        results = await Chef.findRecipesByUser(req.user.id, req.params.id);
        const recipes = results.rows;

        async function getFiles(recipeId) {
            
            let files = await Recipe.files(recipeId);
            files = files.map(file => ({
                ...file, 
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }));

            return files[0];
        }

        const recipesPromise = recipes.map(async recipe => {
            recipe.files = await getFiles(recipe.id);

            return recipe;
        });

        const data = await Promise.all(recipesPromise); 

        return res.render("admin/chefs/show", {chef, recipes: data, avatar: avatarData, user: req.user});
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
            const { filename, path } = file;

            const data = {
                name: filename,
                path
            };

            fileId = await File.create(data);

            return;
        });

        await Promise.all(filesPromise);

        const data = {
            ...req.body,
            file_id: fileId
        }

        const chefId = await Chef.create(data);
        
        return res.redirect(`/admin/chefs/${chefId}`);
    },
    async edit(req, res) {
        const chef = await Chef.findOne({where: {id: req.params.id}});

        chef.total_recipes = await Recipe.totalRecipesBy({where: {chef_id: chef.id}});

        if (!chef) return res.send("Chef not found!");
    
        chef.created_at = date(chef.created_at).format;

        const avatar = await File.findOne({where: {id: chef.file_id}});

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

        return res.render("admin/chefs/edit", {chef, avatar: avatarData, user: req.user});
    },
    async put(req, res) {
        try {
            const { id, name } = req.body;
            const keys = Object.keys(req.body);
        
            for (key of keys) {
                if (req.body[key] == "" && key != "removed_files") {
                    return res.send(`Please, fill all the fields! ${key}`);
                };
            };

            let fileId = 0;

            if (req.files.length != 0) {
                const newFilesPromise = req.files.map(async file => {
                    const { filename, path } = file;

                    const data = {
                        name: filename,
                        path
                    };

                    fileId = await File.create(data);

                    return;
                });

                await Promise.all(newFilesPromise);
            };

            if (req.body.removed_files) {
                const removedFiles = req.body.removed_files;
                
                await File.delete(removedFiles);
            };

            const data = {
                name
            }

            if (fileId != 0 ) data.file_id = fileId;

            await Chef.update(id, data);
            
            return res.redirect(`chefs/${id}`);
        } catch (error) {
            console.error(error);
        }
    },
    async delete(req, res) {
        const chef = await Chef.findOne({where: {id: req.body.id}});

        const file = await File.findOne({where: {id: chef.file_id}});

        fs.unlinkSync(file.path);

        await File.delete(file.id);

        await Chef.delete(req.body.id);

        return res.redirect(`/admin/chefs`);
    }
};