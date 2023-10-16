const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const app = express();

const postapi = require('./plugins/postapi')
app.use(postapi)

const pos = require('./plugins/readapi')
app.use(pos)
app.use(express.urlencoded({ limit: '5mb' ,extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
const db = require('./plugins/dbapi')
db.run(`
  CREATE TABLE IF NOT EXISTS pastes (
    id INTEGER PRIMARY KEY,
    endpoint TEXT NOT NULL,
    kode TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);
app.use(express.static('public'));
app.get('/', (req, res) => {
  db.get('SELECT COUNT(*) AS pasteCount FROM pastes', (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    const pasteCount = row.pasteCount;

    const forkId = req.query.forkid;
    if (forkId) {
      db.get('SELECT kode FROM pastes WHERE endpoint = ?', [forkId], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        if (row) {
          res.render('index', { paste: pasteCount, kode: row.kode });
        } else {
          res.render('index', { paste: pasteCount, kode: '' });
        }
      });
    } else {
      res.render('index', { paste: pasteCount, kode: '' });
    }
  });
});

app.get('/status', (req, res) => {
  const statsu = req.query.ep
    res.render('status', { info: statsu });
});
app.get('/pasted', (req, res) => {
  res.sendFile(__dirname + '/pasted.html');
});
app.get('/t', (req, res) => {
  res.redirect('/')
})
app.listen(80, () => {
  console.log('Server Ready!');
});
