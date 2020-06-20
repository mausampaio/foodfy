const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");
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

        let results = await Recipe.paginate(params);
        const recipes = results.rows;

        const pagination = {
            total: Math.ceil(recipes[0].total / limit),
            page
        };

        if (!recipes) return res.send('Recipes not found!');

        async function getFiles(recipeId) {
            
            results = await Recipe.files(recipeId);
            const files = results.rows.map(file => ({
                ...file, 
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }));

            return files[0];
        }

        const recipesPromise = results.rows.map(async recipe => {
            recipe.files = await getFiles(recipe.id);

            return recipe;
        });

        const data = await Promise.all(recipesPromise);

        // let data = [];

        // for (recipe of recipes) {
        //     results = await Recipe.files(recipe.id);
        //     let files = results.rows.map(file => ({
        //         ...file, 
        //         src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        //     }));
            
        //     data.push({files: files[0], ...recipe});

        //     files = [];
        // };        

        return res.render("admin/recipes/index", {recipes: data, pagination});
    },
    async show(req, res) {
        let results = await Recipe.find(req.params.id);
        const recipe = results.rows[0];

        if (!recipe) return res.send("Recipe not found!");

        recipe.created_at = date(recipe.created_at).format;

        results = await Recipe.files(recipe.id);
        const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }));

        return res.render("admin/recipes/show", {recipe, files});
    },
    async create(req, res) {
        let results = await Recipe.chefSelectOptions();
        const options = results.rows;

        const recipe = {
            ingredients: [""],
            preparation: [""]
        };

        return res.render("admin/recipes/create", {recipe, chefOptions: options});
    },
    async post(req, res) {
        const keys = Object.keys(req.body);
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };

        if (req.files.length == 0) return res.send('Please, send at least one image');

        let results = await Recipe.create(req.body);
        const recipeId = results.rows[0].id;

        const filesPromise = req.files.map(async file => {
            results = await File.create({...file});
            const fileId = results.rows[0].id; 

            await Recipe_Files.create({recipe_id: recipeId, file_id: fileId});

            return
        });

        await Promise.all(filesPromise);

        return res.redirect(`/admin/recipes/${recipeId}`);
    },
    async edit(req, res) {
        let results = await Recipe.find(req.params.id);
        const recipe = results.rows[0];

        if (!recipe) return res.send("Recipe not found!");
    
        recipe.created_at = date(recipe.created_at).format;
        recipe.ingredients = recipe.ingredients || [""];
        recipe.preparation = recipe.preparation || [""];

        results = await Recipe.chefSelectOptions();
        const options = results.rows;
        
        results = await Recipe.files(recipe.id);
        const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }));

        return res.render("admin/recipes/edit", {recipe, chefOptions: options, files});
    },
    async put(req, res) {
        const keys = Object.keys(req.body);
    
        for (key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send(`Please, fill all the fields! ${key}`);
            };
        };

        const recipeId = req.body.id;

        if (req.files.length != 0) {
            const newFilesPromise = req.files.map(async file => {
                results = await File.create({...file});
                const fileId = results.rows[0].id;

                await Recipe_Files.create({recipe_id: recipeId, file_id: fileId});
    
                return
            });

            await Promise.all(newFilesPromise);
        };

        if (req.body.removed_files) {
            const removedFiles = req.body.removed_files.split(",");
            const lastIndex = removedFiles.length -1;
            removedFiles.splice(lastIndex, 1);

            const removedFilesPromise = removedFiles.map(id => {
                Recipe_Files.deleteByFile(id);

                File.delete(id);

                return
            });

            await Promise.all(removedFilesPromise);
        };

        await Recipe.update(req.body);

        return res.redirect(`recipes/${req.body.id}`);
    },
    async delete(req, res) {
        let results = await Recipe.find(req.body.id);
        const recipe = results.rows[0];

        results = await Recipe.files(recipe.id);
        const files = results.rows;

        await Recipe_Files.deleteByRecipe(recipe.id);

        for (file of files) {
            await File.delete(file.id);
        };


        await Recipe.delete(req.body.id);

        return res.redirect(`/admin/recipes`);
    }
};