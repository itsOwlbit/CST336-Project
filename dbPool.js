const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "s465z7sj4pwhp7fn.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "p8uq2blx8o6hr2vy",
    password: "nkqjfp10sejzsea8",
    database: "edy8t9yibba3jtr0"
});

module.exports = pool;
