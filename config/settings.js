var mysql = require('mysql');
exports = module.exports = {
    connection: mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        database: 'testonline'
    }),
    pool: mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        database: 'testonline'
    }),
    mailConfig: {
        host : '127.0.0.1',
        port : 3000,
        path : '/mail/send',
        method : 'POST',
        encoding : 'utf-8'
    },
    loginConfig: {
        username: 'testonline',
        password: 'wdk123456'
    },
    sessionTime: 1000*60*60*24*7
}
