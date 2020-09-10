const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'users' });

module.exports = {
    ...Base,
    paginate(params) {
        try {
            const {limit, offset} = params;
            const totalQuery = `(SELECT count(*) FROM users) AS total`;

            const query = `SELECT *, ${totalQuery} FROM users
            ORDER BY users.name
            LIMIT $1 OFFSET $2`;

            return db.query(query, [limit, offset]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    async totalRecipes(userId) {
        return db.query(`SELECT users.*, count(recipes) AS total_recipes
        FROM users
        LEFT JOIN recipes ON (recipes.user_id = users.id)
        WHERE users.id = ${userId}
        GROUP BY users.id
        `);
    }
};