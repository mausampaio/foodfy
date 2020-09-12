const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'users' });

module.exports = {
    ...Base,
    async totalRecipes(userId) {
        return db.query(`SELECT users.*, count(recipes) AS total_recipes
        FROM users
        LEFT JOIN recipes ON (recipes.user_id = users.id)
        WHERE users.id = ${userId}
        GROUP BY users.id
        `);
    }
};