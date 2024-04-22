const mysql = require('mysql');
require("dotenv").config();

// Create a connection to the MySQL server

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});

async function connectMySql() {
  try {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL server: ' + err.stack);
        return;
      }

      console.log('Connected to MySQL server as id ' + connection.threadId);
    });
  }
  catch (err) {
    console.log(err);
  }
}

function dataToFetch(cb) {
  try {
    connection.query('SELECT * FROM userSessions', (err, rows) => {
      // console.log(rows);
      if (err) {
        console.error('Error executing query: ' + err.stack);
        cb(err, null);
        return;
      }
      console.log('Data retrieved from userSessions table:');
      cb(null, rows);
      return;
    });
  } catch (err) {
    console.log('Error in dataToFetch:', err);
  }
}

async function dataToInsert(UserSessionForUser) {
  const data = { username: UserSessionForUser.username, numberOfTimesLoggedIn: UserSessionForUser.numberOfTimesLoggedIn, LastLogin: UserSessionForUser.lastLogin, activity: UserSessionForUser.activity, created_at: UserSessionForUser.createdAt, last_updated: UserSessionForUser.updatedAt };

  console.log("this is console under datatoinsert .......   " + JSON.stringify(UserSessionForUser) + "the data is " + JSON.stringify(data));
  connection.query('INSERT INTO userSessions SET?', data, (err, rows) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      return;
    }
    console.log('Data inserted into  MySQL server:');
    console.log(rows);
  });

}

async function disConnectMysql() {

  connection.end((err) => {
    if (err) {
      console.error('Error closing connection: ' + err.stack);
      return;
    }
    console.log('Connection closed.');
  });
}


module.exports = { connectMySql, dataToInsert, disConnectMysql }
