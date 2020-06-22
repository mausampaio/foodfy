const {date} = require('../../lib/utils');
const { hash } = require('bcryptjs');
const db = require('../../config/db')
const mailer = require('../../lib/mailer');

module.exports = {
    all() {
        return db.query(`SELECT * FROM users`);
    },
    async create(data) {
        try {
            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    is_admin
                ) VALUES ($1, $2, $3, $4)
                RETURNING id
            `;

            const randomstring = Math.random().toString(36).slice(-8);
            
            const passwordHash = await hash(randomstring, 8);

            if (data.is_admin != "true") {
                data.is_admin = false;
            } else {
                data.is_admin = true;
            };

            const values = [
                data.name,
                data.email,
                passwordHash,
                data.is_admin
            ];

            const results = await db.query(query, values);

            await mailer.sendMail({
                to: data.email,
                from: 'no-reply@foodfy.com.br',
                subject: 'Bem-vindo ao Foodfy!',
                html: `
                    <h2>Parabéns! O seu cadastro no Foodfy foi realizado com sucesso!</h2>
                    <p>Para realizar o acesso ao sistema basta utilizar os dados abaixo:</p>
                    <ul>
                        <li>
                            Usuário: ${data.email}
                        </li>
                        <li>
                            Senha: ${randomstring}
                        </li>
                    </ul>
                `
            });

            return results.rows[0].id;
        } catch(err) {
            console.error(err);
        };
    },
    paginate(params) {
        try {
            const {limit, offset} = params;
            const totalQuery = `(SELECT count(*) FROM users) AS total`;

            const query = `SELECT *, ${totalQuery} FROM users
            LIMIT $1 OFFSET $2`;

            return db.query(query, [limit, offset]);
        }catch(err) {
            throw `Database Error! ${err}`;
        };
    },
    findById(id) {
        return db.query(`SELECT * FROM users
        WHERE users.id = ${id}
        `);
    },
    async totalRecipes(userId) {
        return db.query(`SELECT users.*, count(recipes) AS total_recipes
        FROM users
        LEFT JOIN recipes ON (recipes.user_id = users.id)
        WHERE users.id = ${userId}
        GROUP BY users.id
        `);
    },
    async findOne(filters) {
        let query = "SELECT * FROM users";

        Object.keys(filters).map(key => {
            query = `${query} ${key}`;

            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`;
            });
        });

        const results = await db.query(query);

        return results.rows[0];
    },
    async update(id, data) {
        let query = "UPDATE users SET";

        Object.keys(data).map((key, index, array) => {
            if ((index+ 1) < array.length) {
                query = `${query} ${key} = '${data[key]}',`
            } else {
                query = `${query} ${key} = '${data[key]}'
                WHERE id = ${id}`
            };
        });

        await db.query(query);
        return;
    },
    delete(id) {
        return db.query(`DELETE FROM users WHERE id = $1`, [id]);
    }
};