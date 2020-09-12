const {date} = require('../../lib/utils');
const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'chefs' });

module.exports = {
    ...Base
}