const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const app = express();
const db = new sqlite3.Database('database.sqlite');
app.use(express.urlencoded({ limit: '5mb' ,extended: true }));
app.use(express.json());
app.get('/t/:endpoint/:method?', (req, res) => {
    const { endpoint, method } = req.params;
    const { token } = req.query;
  
    db.get('SELECT * FROM pastes WHERE endpoint = ?', [endpoint], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (!result) {
        return res.status(404).send('Invalid Endpoint');
      }
  
      const storedPassword = result.password;
      if (storedPassword === null || storedPassword === '' || token === storedPassword) {
        if (method === 'json') {
          res.json({ status: 'OK',endpoint: endpoint, content: result.kode });
        } else if (method === 'raw') {
          const datatest = result.kode.replace(/(\r\n|\r|\n)/g, '\n');
          res.setHeader('Content-Type', 'text/plain');
          res.send(datatest);
        } else {
          res.render('pasred', { pasted: result.kode, endpoint: endpoint });
        }
      } else {
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('[Server] ' + clientIP + ' Visiting Paste with encrypted password ' + endpoint);
        res.render('password', { endpoint: endpoint, action: method });
      }
    });
  });

      module.exports = app;