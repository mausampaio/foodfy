const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'recipes' });

module.exports = {
    ...Base,
    async highlights() {
        try {
            const results = await db.query(`SELECT recipes.*, chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.page_accesses is not null
            ORDER BY recipes.page_accesses DESC
            LIMIT 6`);

            return results.rows;
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    async files(id) {
        const results = await db.query(`SELECT files.*
        FROM files
        LEFT JOIN recipe_files ON (recipe_files.file_id = files.id)
        WHERE recipe_id = $1`, [id]);

        return results.rows
    },
    async totalRecipesBy(filters) {
        try {
            let query = `SELECT count(recipes) AS total_recipes FROM recipes`;

            Object.keys(filters).map(key => {
                query += ` ${key}`;
          
                Object.keys(filters[key]).map(field => {
                  query += ` ${field} = '${filters[key][field]}'`;
                });
            });

            const results = await db.query(query);

            return results.rows[0].total_recipes;
        } catch (error) {
            console.error(error);
        }
    }
};