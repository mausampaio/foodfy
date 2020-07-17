const { hash } = require('bcryptjs');
const data = require('./data.json');

const Chef = require('./src/app/models/Chef');
const File = require('./src/app/models/File');

let chefsIds = [];

async function createChefs() {
    const chefs = data.chefs;

    for (chef of chefs) {
        const file = {
            name: chef.file.name,
            path: chef.file.path
        }

        let results = await File.create(file);
        const fileId = results.rows[0].id;

        const params = {
            name: chef.name,
            file_id: fileId
        };

        results = await Chef.create(params);
        chefsIds.push(results.rows[0].id);
    };
};

async function init() {
    await createChefs();
};

init();