const mysql = require('mysql');
const config = require('./../config/config.json');

const con = mysql.createConnection({
    host: config.development.host,
    port: config.development.port,
    user: config.development.username,
    password: config.development.password,
    database: config.development.database
});

exports.open = function () {
    return new Promise(function (resolve) {
        con.connect((err) => {
            if (err) {
                console.log('Error connecting to db');
                reject("Open Error", err.message);
                return;    
            } else {
                console.log('Database connection successful!!!');
                resolve(true);
            }
        })
    })
}


exports.executeNonQuery = function (query, params) {
    console.log("Execute Non Query : ", query, params)
    return new Promise(function (resolve, reject) {
        let stmt = con.query(query, params, (err, res) => {
            if (err) reject(err.message);
            resolve(true);
        })
    })
}

exports.executeUpdate = function (table_name, params, whereQuery) {
    let updateParams = Object.values(params);
    updateParams.push(...Object.values(whereQuery));
    console.log("Params : ", params);
    return new Promise(function (resolve, reject) {
        let stmt = con.query(`UPDATE ${table_name} SET ${Object.keys(params).join('=?, ')+"=?"} WHERE ${Object.keys(whereQuery).join('=?, ')+"=?"} `, updateParams, 
        (err, res) => {
            if (err) reject(err.message);
            resolve(true)
        })
    })

}

exports.close = function () {
    return new Promise(function (resolve, reject) {
        con.end((err) => {
            if (err) {
                reject("Close error : ", err.message)
                return    
            } else {
                resolve(true);
            }
        })
    })
}