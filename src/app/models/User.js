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
    async update(data) {
        const query = `
            UPDATE users SET
                name=$1,
                email=$2,
                is_admin=$3
            WHERE id = $4
        `;

        if (data.is_admin != "true") {
            data.is_admin = false;
        } else {
            data.is_admin = true;
        };

        const values = [
            data.name,
            data.email,
            data.is_admin,
            data.id
        ];

        return db.query(query, values);
    }
};