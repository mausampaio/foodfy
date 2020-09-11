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
    async findByUser(params) {
        try {
            const { limit, offset, userId } = params;

            const totalQuery = `(SELECT count(*) FROM recipes
            LEFT JOIN users ON (recipes.user_id = users.id) 
            WHERE user_id = ${userId}
            ) AS total`
            
            const results = await db.query(`SELECT recipes.*, ${totalQuery},chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            LEFT JOIN users ON (recipes.user_id = users.id) 
            WHERE user_id = $1
            LIMIT $2 OFFSET $3`, [userId, limit, offset]);

            return results.rows;
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    async paginate(params) {
        try {
            const {filter, limit, offset} = params;

            let query = "",
                filterQuery = "",
                totalQuery = `(SELECT count(*) FROM recipes) AS total`

            if (filter) {
                filterQuery = `WHERE recipes.title ILIKE '%${filter}%'`;

                totalQuery = `(SELECT count(*) FROM recipes
                ${filterQuery}) as total`;
            };

            query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name 
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
            ${filterQuery}
            ORDER BY recipes.updated_at DESC
            LIMIT $1 OFFSET $2`;

            const results = await db.query(query, [limit, offset]);
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
    async totalRecipesByChef(id) {
        try {
            const results = await db.query(`
                SELECT count(recipes) AS total_recipes
                FROM recipes
                WHERE recipes.chef_id = ${id}
            `);

            return results.rows[0].total_recipes;
        } catch (error) {
            console.error(error);
        }
    }
};