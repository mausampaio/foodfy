const {date} = require('../../lib/utils');
const db = require('../../config/db')

module.exports = {
    all() {
        return db.query(`SELECT * FROM users`);
    }
};