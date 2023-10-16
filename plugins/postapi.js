const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const app = express();
const db = new sqlite3.Database('database.sqlite');
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
const sessionFile = 'session/session.json';
let sessionData = {};
const crypto = require('crypto');

const downloadTokensFile = 'tokens.json';
let downloadTokens = {};
try {
  const jsonData = fs.readFileSync(downloadTokensFile, 'utf8');
  downloadTokens = JSON.parse(jsonData);
} catch (err) {
  downloadTokens = {};
}
function generateRandomEndpoint() {
  const randomBytes = crypto.randomBytes(10); 
  return randomBytes.toString('hex');
}
function saveDownloadTokens() {
  fs.writeFileSync(downloadTokensFile, JSON.stringify(downloadTokens));
}

function saveSessionData() {
  fs.writeFile(sessionFile, JSON.stringify(sessionData), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function loadSessionData() {
  try {
    const jsonData = fs.readFileSync(sessionFile, 'utf8');
    sessionData = JSON.parse(jsonData);
  } catch (err) {
    sessionData = {};
  }
}

app.post('/postform', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const currentTime = Date.now();

  loadSessionData();

  if (sessionData[clientIP] && currentTime - sessionData[clientIP] < 10000) {
    return res.status(429).render('status', {});
  }

  const { kode, endpoint, password } = req.body;
  if (!kode) {
    res.send('Broken Pipe()');
  } else {
    let generatedEndpoint = endpoint || generateRandomEndpoint();

    if (!/^[a-zA-Z0-9-_]+$/.test(generatedEndpoint)) {
      generatedEndpoint = generateRandomEndpoint();
    }

    db.get('SELECT * FROM pastes WHERE endpoint = ?', [generatedEndpoint], (err, row) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else if (row) {
        res.status(400).json({ status: 400, message: 'Endpoint already exists.' });
      } else {
        db.run('INSERT INTO pastes (endpoint, kode, password) VALUES (?, ?, ?)', [generatedEndpoint, kode, password], (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(500);
          } else {
            sessionData[clientIP] = currentTime;
            saveSessionData();
            res.redirect('/t/' + generatedEndpoint);
          }
        });
      }
    });
  }
  sessionData[clientIP] = currentTime;
  saveSessionData();
});
const DOWNLOAD_LIMIT = 2;
let tokenUsage = {};
app.post('/postform-api', (req, res) => {
  const { kode, endpoint, password } = req.body;
  if (!kode) {
    res.json({ code: 400, status: 'Broken PIPE' });
  } else {
    db.get('SELECT * FROM pastes WHERE endpoint = ?', [endpoint], (err, row) => {
      if (err) {
        console.error(err);
        res.json({ code: 500, status: 'Internal server throttle' });
      } else if (row) {
        res.status(400).json({ code: 400, status: 'Endpoint already exists.' });
      } else {
        const generatedEndpoint = endpoint || generateRandomEndpoint();
        const token = crypto.randomBytes(20).toString('hex');
        downloadTokens[token] = generatedEndpoint;
        tokenUsage[token] = 0;
        saveDownloadTokens();

        db.run('INSERT INTO pastes (endpoint, kode, password) VALUES (?, ?, ?)', [generatedEndpoint, kode, password], (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(500);
          } else {
            res.json({ code: 200, kode: kode, endpoint: 'https://' + req.hostname + '/t/' + generatedEndpoint, downloadapi: 'https://' + req.hostname + req.baseUrl + '/downloader-api?tokenkey=' + token });
          }
        });
      }
    });
  }
});

// Modify the downloader-api route
app.get('/downloader-api', (req, res) => {
  const { tokenkey } = req.query;
  const endpoint = downloadTokens[tokenkey];

  if (!endpoint) {
    res.status(404).json({ code: 404, status: 'Token not found' });
  } else {
    if (tokenUsage[tokenkey] < DOWNLOAD_LIMIT) {
      db.get('SELECT kode FROM pastes WHERE endpoint = ?', [endpoint], (err, row) => {
        if (err) {
          console.error(err);
          res.status(500).json({ code: 500, status: 'Internal server error' });
        } else if (!row) {
          res.status(404).json({ code: 404, status: 'Endpoint not found' });
        } else {
          const fileName = `${endpoint}.txt`; // Construct the filename dynamically
          res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
          res.setHeader('Content-type', 'text/plain');
          res.send(row.kode); // Serve the text content from the database
          tokenUsage[tokenkey]++; // Increment the token usage count
          saveDownloadTokens(); // Save the updated downloadTokens
        }
      });
    } else {
      res.status(403).json({ code: 403, status: 'Token usage limit exceeded' });
    }
  }
});

module.exports = app;
