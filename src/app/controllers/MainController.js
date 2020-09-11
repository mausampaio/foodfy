const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const File = require("../models/File");

module.exports = {
    async index(req, res) {
        let results = await Recipe.highlights();
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

        return res.render("main/index", {itens: data});
    },
    about(req, res) {
        return res.render("main/about");
    },
    async recipes(req, res) {
        let {filter, page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 6;
        let offset = limit * (page -1);

        const params = {
            filter,
            page,
            limit,
            offset
        };

        let results = await Recipe.paginate(params);
        const recipes = results.rows;

        async function getFiles(recipeId) {
            
            results = await Recipe.files(recipeId);
            const files = results.rows.map(file => ({
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

        if (Array.isArray(recipes) && recipes.length) {
            const pagination = {
                total: Math.ceil(recipes[0].total / limit),
                page
            };

            return res.render('main/recipes/recipes', {recipes: data, pagination, filter});
        } else {
            const result = 'Nenhum resultado foi encontrado...'
            const pagination = {
                total: 0,
                page
            };

            return res.render('main/recipes/recipes', {recipes: data, pagination, filter, result});
        };
    },
    async chefs(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 16;
        let offset = limit * (page -1);

        const params = {
            page,
            limit,
            offset
        };

        let results = await Chef.paginate(params);
        const chefs = results.rows;

        const pagination = {
            total: Math.ceil(chefs[0].total / limit),
            page
        };

        async function getAvatar(fileId) {
            const avatar = await File.findOne({where: {id: fileId}});
        
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

        return res.render("main/chefs/chefs", {chefs: data, pagination});
    },
    async recipe(req, res) {
        let results = await Recipe.find(req.params.id);
        const recipe = results.rows[0];

        if (recipe.page_accesses == null) {
            recipe.page_accesses = 0;
        };

        recipe.page_accesses = recipe.page_accesses + 1;

        await Recipe.updateAccess({id: recipe.id, page_accesses: recipe.page_accesses});

        console.log(recipe.page_accesses);

        if (!recipe) return res.send("Recipe not found!");
    
        recipe.created_at = date(recipe.created_at).format;

        results = await Recipe.files(recipe.id);
        const files = results.rows.map(file => ({
            ...file, 
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }));
    
        return res.render("main/recipes/show", {recipe, files});
    },
    async chef(req, res) {
        const chef = await Chef.findOne({where: {id: req.params.id}});

        chef.total_recipes = await Recipe.totalRecipesByChef(req.params.id);

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

        results = await Recipe.findByChef(chef.id);
        const recipes = results.rows;

        async function getFiles(recipeId) {
            
            results = await Recipe.files(recipeId);
            const files = results.rows.map(file => ({
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

        return res.render("main/chefs/show", {chef, recipes: data, avatar: avatarData});
    }
};