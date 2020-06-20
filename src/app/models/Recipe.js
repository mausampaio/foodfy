const {date} = require('../../lib/utils');
const db = require('../../config/db')

module.exports = {
    all() {
        return db.query(`SELECT recipes.*, chefs.name as chef_name 
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        ORDER BY recipes.updated_at DESC`);
    },
    highlights() {
        try {
            return db.query(`SELECT recipes.*, chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            LIMIT 6`);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    create(data) {
        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                user_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.user_id
        ];

        return db.query(query, values);
    },
    find(id) {
        return db.query(`SELECT recipes.*, chefs.name as chef_name 
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
        WHERE recipes.id = $1`, [id]);
    },
    findByChef(chefId) {
        try {
            return db.query(`SELECT recipes.*, chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
            WHERE chef_id = $1`, [chefId]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    findByUser(params) {
        try {
            const { limit, offset, userId } = params;

            return db.query(`SELECT recipes.* 
            FROM recipes
            LEFT JOIN users ON (recipes.user_id = users.id) 
            WHERE chef_id = $1
            LIMIT $2 OFFSET $3`, [userId, limit, offset]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    update(data) {
        const query = `
            UPDATE recipes SET
                chef_id=$1,
                title=$2,
                ingredients=$3,
                preparation=$4,
                information=$5
            WHERE id = $6
        `;

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ];

        return db.query(query, values);
    },
    delete(id) {
        return db.query(`DELETE FROM recipes WHERE id = $1`, [id]);
    },
    chefSelectOptions() {
        return db.query(`SELECT name, id FROM chefs`);
    },
    paginate(params) {
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
            LIMIT $1 OFFSET $2`;

            return db.query(query, [limit, offset]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    files(id) {
        return db.query(`SELECT files.*
        FROM files
        LEFT JOIN recipe_files ON (recipe_files.file_id = files.id)
        WHERE recipe_id = $1`, [id]);
    }
};