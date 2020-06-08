const {date} = require("../../lib/utils"); 
const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");

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
        let results = await Chef.all();
        const chefs = results.rows;

        let data = [];

        for (chef of chefs) {
            if (chef.file_id != null) {
                results = await Chef.avatar(chef.file_id);
                const avatar = results.rows[0];

                console.log(avatar);
                

                avatarData = {
                    ...avatar,
                    src: `${req.protocol}://${req.headers.host}${avatar.path.replace("public", "")}`
                };

                data.push({avatar: avatarData, ...chef});
            }else {
                data.push({avatar: {src: "http://placehold.it/200x200?text=CHEF SEM FOTO"}, ...chef});
            };
        };

        return res.render("main/chefs/chefs", {chefs: data});
    },
    async recipe(req, res) {
        let results = await Recipe.find(req.params.id);
        const recipe = results.rows[0];

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

        results = await Recipe.findByChef(chef.id);
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

        return res.render("main/chefs/show", {chef, recipes: data, avatar: avatarData});
    }
};