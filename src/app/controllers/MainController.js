const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const File = require("../models/File");

module.exports = {
    async index(req, res) {
        const recipes = await Recipe.highlights();

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
            limit,
            offset
        };

        if (filter) params.filters = {where: {'recipes.title': filter}};

        const recipes = await Recipe.paginate(params);

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

        const pagination = {
            page
        };

        if (Array.isArray(recipes) && recipes.length) {
            pagination.total = Math.ceil(recipes[0].total / limit);
            return res.render('main/recipes/recipes', {recipes: data, pagination, filter});
        } else {
            const result = 'Nenhum resultado foi encontrado...'
            pagination.total = 0;
            return res.render('main/recipes/recipes', {recipes: data, pagination, filter, result});
        };
    },
    async chefs(req, res) {
        let {page, limit} = req.query;
    
        page = page || 1;
        limit = limit || 16;
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

            chef.total_recipes = await Recipe.totalRecipesByChef(chef.id);
            
            return chef;
        })

        const data = await Promise.all(chefsPromise);

        return res.render("main/chefs/chefs", {chefs: data, pagination});
    },
    async recipe(req, res) {
        const recipe = await Recipe.findOne({where: {id: req.params.id}});

        const chef = await Chef.findOne({where: {id: recipe.chef_id}});

        recipe.chef_name = chef.name;

        if (!recipe) return res.send("Recipe not found!");

        if (recipe.page_accesses == null) {
            recipe.page_accesses = 0;
        };

        recipe.page_accesses = recipe.page_accesses + 1;

        await Recipe.update(recipe.id, {page_accesses: recipe.page_accesses});
    
        recipe.created_at = date(recipe.created_at).format;

        let files = await Recipe.files(recipe.id);
        files = files.map(file => ({
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

        const recipes = await Recipe.findAll({where: {chef_id: chef.id}});

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

        return res.render("main/chefs/show", {chef, recipes: data, avatar: avatarData});
    }
};