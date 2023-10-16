const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const jsonFilePath = 'database.json';
const databasePath = 'database.sqlite';

const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

const db = new sqlite3.Database(databasePath);

db.serialize(() => {
    const insertStmt = db.prepare('INSERT INTO pastes (kode, endpoint, password) VALUES (?, ?, ?)');

    jsonData.forEach(item => {
        insertStmt.run(item.kode, item.endpoint, '');

        console.log(`Restored: ${item.endpoint}`);
    });

    insertStmt.finalize();
});

db.close();
console.log('Complete✅');
