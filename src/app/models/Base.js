const db = require('../../config/db');

function find(filters, table) {
  let query = `SELECT * FROM ${table}`;

  if (filters) {
    Object.keys(filters).map(key => {
        query += ` ${key}`;
  
        Object.keys(filters[key]).map(field => {
            query += ` ${field} = '${filters[key][field]}'`;
        });
    });
  }

  return db.query(query);
}

const Base = {
  init({ table }) {
    if(!table) throw new Error('Invalid Params');

    this.table = table;

    return this;
  },
  async findOne(filters) {
    const results = await find(filters, this.table);

    return results.rows[0];
  },
  async findAll(filters) {
    const results = await find(filters, this.table);

    return results.rows;
  },
  async paginate(params) {
    const {searchs, filters, limit, offset} = params;

    let totalQuery = `(SELECT count(*) FROM ${this.table}`,
    query = `SELECT ${this.table}.*`,
    search = ``;
    filter = ``;

  
    if (searchs) {
      Object.keys(searchs).map(key => {
          search += ` ${key}`;
    
          Object.keys(searchs[key]).map(field => {
              search += ` ${field} ILIKE '%${searchs[key][field]}%'`;
          });
      });
    }

    if (filters) {
      Object.keys(filters).map(key => {
          filter += ` ${key}`;
    
          Object.keys(filters[key]).map(field => {
              filter += ` ${field} = '${filters[key][field]}'`;
          });
      });
    }

    totalQuery += `${search} ${filter}) AS total`;
    query += `, ${totalQuery} FROM ${this.table} ${search} ${filter} ORDER BY ${this.table}.updated_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log(query)

    const results = await db.query(query);
  
    return results.rows;
  },
  async create(fields) {
    try {
      let keys = [],
      values = [];

      Object.keys(fields).map(key => {
        keys.push(key);
        values.push(`'${fields[key]}'`);
      });

      const query = `
        INSERT INTO ${this.table} (${keys.join(',')})
        VALUES (${values.join(',')})
        RETURNING id
      `

      const results = await db.query(query);
      return results.rows[0].id;
    } catch (error) {
      console.error(error);
    }
  },
  update(id, data) {
    try {
      let update = [];

      Object.keys(data).map(key => {
          const line = `${key} = '${data[key]}'`;
          update.push(line);
      });

      let query = `
        UPDATE ${this.table} SET
        ${update.join(',')}
        WHERE id = ${id}
      `;

      return db.query(query);
    } catch (error) {
      console.error(error);
    }
  },
  delete(id) {
    return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id]);
  },
  deleteBy(filters) {
    let query = `DELETE FROM ${this.table}`;

    Object.keys(filters).map(key => {
      query += ` ${key}`;

      Object.keys(filters[key]).map(field => {
        query += ` ${field} = '${filters[key][field]}'`;
      });
    });

    return db.query(query)
  }
}

module.exports = Base;