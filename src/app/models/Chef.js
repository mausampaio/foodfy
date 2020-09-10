const {date} = require('../../lib/utils');
const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'chefs' });

module.exports = {
    ...Base,
    findByUser(chefId, userId) {
        try {
            return db.query(`SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            LEFT JOIN users ON (recipes.user_id = users.id)
            WHERE chefs.id = $1 AND recipes.user_id = $2
            GROUP BY chefs.id`, [chefId, userId]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    findRecipesByUser(userId, chefId) {
        try {
            return db.query(`SELECT recipes.*, chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
            LEFT JOIN users ON (recipes.user_id = users.id)
            WHERE recipes.user_id = $1
            AND recipes.chef_id = $2`, [userId, chefId]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    paginate(params) {
        try {
            const {limit, offset} = params;
            const totalQuery = `(SELECT count(*) FROM chefs) AS total`;

            const query = `SELECT chefs.*, ${totalQuery}, count(recipes) AS total_recipes 
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            GROUP BY chefs.id
            ORDER BY total_recipes DESC
            LIMIT $1 OFFSET $2`;

            return db.query(query, [limit, offset]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    }
}