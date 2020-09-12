const {date} = require("../../lib/utils"); 
const fs = require('fs');
const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const File = require("../models/File");
const Recipe_Files = require("../models/Recipe_Files");

module.exports = {
    async index(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 4;
        let offset = limit * (page -1);

        const params = {
            page,
            limit,
            offset
        };

        const recipes = await Recipe.paginate(params);

        const pagination = {
            total: Array.isArray(recipes) && recipes.length 
                ? Math.ceil(recipes[0].total / limit) 
                : 0,
            page
        };

        if (!recipes) return res.send('Recipes not found!');

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

        return res.render("admin/recipes/index", {recipes: data, pagination});
    },
    async restrictedIndex(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 4;
        let offset = limit * (page -1);

        const params = {
            page,
            limit,
            offset,
            userId: req.session.userId
        };

        const recipes = await Recipe.findByUser(params);

        const pagination = {
            total: Array.isArray(recipes) && recipes.length 
                ? Math.ceil(recipes[0].total / limit)
                : 0,
            page
        };
        
        if (!recipes) return res.send('Recipes not found!');

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

        return res.render("admin/recipes/index", {recipes: data, pagination});
    },
    async show(req, res) {
        const recipe = await Recipe.findOne({where: {id: req.params.id}});

        const chef = await Chef.findOne({where: {id: recipe.chef_id}});

        recipe.chef_name = chef.name;

        if (!recipe) return res.send("Recipe not found!");

        recipe.created_at = date(recipe.created_at).format;

        let files = await Recipe.files(recipe.id);
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }));

        return res.render("admin/recipes/show", {recipe, files});
    },
    async create(req, res) {
        const options = await Chef.findAll();

        const recipe = {
            ingredients: [""],
            preparation: [""]
        };

        return res.render("admin/recipes/create", {recipe, chefOptions: options});
    },
    async post(req, res) {
        const { chef, title, ingredients, preparation, information } = req.body;
        const keys = Object.keys(req.body);

        console.log(ingredients)
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };

        if (req.files.length == 0) return res.send('Please, send at least one image');

        const data = {
            chef_id: chef,
            title,
            ingredients: `{${ingredients}}`,
            preparation: `{${preparation}}`,
            information,
            user_id: req.session.userId
        };

        const recipeId = await Recipe.create(data);

        const filesPromise = req.files.map(async file => {
            const fileId = await File.create({name: file.filename, path: file.path});

            await Recipe_Files.create({recipe_id: recipeId, file_id: fileId});

            return
        });

        await Promise.all(filesPromise);

        return res.redirect(`/admin/recipes/${recipeId}`);
    },
    async edit(req, res) {
        const recipe = await Recipe.findOne({where: {id: req.params.id}});

        if (!recipe) return res.send("Recipe not found!");
    
        recipe.created_at = date(recipe.created_at).format;
        recipe.ingredients = recipe.ingredients || [""];
        recipe.preparation = recipe.preparation || [""];

        const options = await Chef.findAll();
        
        let files = await Recipe.files(recipe.id);
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }));

        return res.render("admin/recipes/edit", {recipe, chefOptions: options, files});
    },
    async put(req, res) {
        const { chef, title, ingredients, preparation, information, id, removed_files } = req.body;
        const keys = Object.keys(req.body);
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };

        const recipeId = req.body.id;

        if (req.files.length != 0) {
            const newFilesPromise = req.files.map(async file => {
                const { filename, path } = file;

                const data = {
                    name: filename,
                    path
                };

                fileId = await File.create(data);

                await Recipe_Files.create({recipe_id: recipeId, file_id: fileId});
    
                return
            });

            await Promise.all(newFilesPromise);
        };

        if (removed_files) {
            const removedFiles = removed_files.split(",");
            const lastIndex = removedFiles.length -1;
            removedFiles.splice(lastIndex, 1);

            const removedFilesPromise = removedFiles.map(id => {
                Recipe_Files.deleteBy({where: {file_id: id}});

                File.delete(id);

                return
            });

            await Promise.all(removedFilesPromise);
        };

        const recipeData = {
            chef_id: chef,
            title,
            ingredients: `{${ingredients}}`,
            preparation: `{${preparation}}`,
            information
        }

        await Recipe.update(id, recipeData);

        return res.redirect(`recipes/${id}`);
    },
    async delete(req, res) {
        const recipe = await Recipe.findOne({where: {id: req.body.id}});

        const files = await Recipe.files(recipe.id);

        await Recipe_Files.deleteBy({where: {recipe_id: recipe.id}});

        for (file of files) {
            fs.unlinkSync(file.path);

            await File.delete(file.id);
        };


        await Recipe.delete(req.body.id);

        return res.redirect(`/admin/recipes`);
    }
};