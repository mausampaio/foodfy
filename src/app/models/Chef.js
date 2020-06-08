const {date} = require('../../lib/utils');
const db = require('../../config/db')

module.exports = {
    all() {
        return db.query(`SELECT chefs.*, count(recipes) AS total_recipes 
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        GROUP BY chefs.id
        ORDER BY total_recipes DESC`);
    },
    create(data) {
        const query = `
            INSERT INTO chefs (
                name,
                file_id,
                created_at
            ) VALUES ($1, $2, $3)
            RETURNING id
        `;

        const values = [
            data.name,
            data.file_id,
            date(Date.now()).iso
        ];

        return db.query(query, values);
    },
    find(id) {
        try {
            return db.query(`SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            WHERE chefs.id = $1 
            GROUP BY chefs.id`, [id]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    findRecipes(id) {
        try {
            return db.query(`SELECT recipes.*, chefs.name as chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
            WHERE recipes.chef_id = $1`, [id]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    update(data) {
        const query = `
            UPDATE chefs SET
                name=$1,
                file_id=$2
            WHERE id = $3
        `;

        const values = [
            data.name,
            data.file_id,
            data.id
        ];

        return db.query(query, values);
    },
    delete(id) {
        return db.query(`DELETE FROM chefs WHERE id = $1`, [id]);
    },
    avatar(file_id) {
        try {
            return db.query(`SELECT files.*
            FROM files
            LEFT JOIN chefs ON (files.id = chefs.file_id)
            WHERE files.id = $1`, [file_id]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    }
}