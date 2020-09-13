const { hash } = require('bcryptjs');
const data = require('./data.json');

const Chef = require('./src/app/models/Chef');
const File = require('./src/app/models/File');
const User = require('./src/app/models/User');
const Recipe = require('./src/app/models/Recipe');
const Recipe_Files = require('./src/app/models/Recipe_Files');

let chefsIds = [];
let usersIds = [];

async function createChefs() {
    const chefs = data.chefs;

    for (chef of chefs) {
        const file = {
            name: chef.file.name,
            path: chef.file.path
        }

        const fileId = await File.create({...file});

        const params = {
            name: chef.name,
            file_id: fileId
        };

        const chefId = await Chef.create(params);
        chefsIds.push(chefId);
    };
};

async function createUsers() {
    const users = data.users;

    for (user of users) {
        const password = await hash(user.password, 8);

        const params = {
            name: user.name,
            email: user.email,
            password,
            is_admin: user.is_admin
        };

        const userId = await User.create(params);
        usersIds.push(userId);
    };
};

async function createRecipes() {
    const recipes = data.recipes;

    for (recipe of recipes) {
        const params = {
            title: recipe.title,
            ingredients: `{${recipe.ingredients}}`,
            preparation: `{${recipe.preparation}}`,
            information: recipe.information,
            chef_id: chefsIds[Math.floor(Math.random() * chefsIds.length)],
            user_id: usersIds[Math.floor(Math.random() * usersIds.length)]
        };

        const recipeId = await Recipe.create(params);

        const imagesPromise = recipe.images.map(async image => {
            const imageData = {
                name: image.name,
                path: image.path
            }
            const fileId = await File.create({...imageData});

            await Recipe_Files.create({recipe_id: recipeId, file_id: fileId});

            return
        });

        await Promise.all(imagesPromise);
    };
};

async function init() {
    await createChefs();
    await createUsers();
    await createRecipes();
};

init();