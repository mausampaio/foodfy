const db = require('../../config/db');
const Base = require('./Base');

Base.init({ table: 'recipe_files' });

module.exports = {
    ...Base
};