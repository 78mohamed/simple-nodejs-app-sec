const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const fs = require('fs');
const app = express();

app.use(express.json());

// Weak database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Hardcoded credentials
    database: 'test_db'
});
db.connect();

// SQL Injection vulnerability
app.get('/user', (req, res) => {
    const userId = req.query.id;
    db.query(`SELECT * FROM users WHERE id = '${userId}'`, (err, result) => { // Unsanitized input
        if (err) throw err;
        res.json(result);
    });
});

// Command Injection vulnerability
app.get('/ping', (req, res) => {
    const ip = req.query.ip;
    require('child_process').exec(`ping -c 4 ${ip}`, (err, stdout) => { // Unsanitized input
        if (err) res.send('Error');
        res.send(stdout);
    });
});

// XSS vulnerability
app.get('/search', (req, res) => {
    const query = req.query.q;
    res.send(`<h1>Results for ${query}</h1>`); // No output encoding
});

// Insecure hashing
app.post('/hash', (req, res) => {
    const password = req.body.password;
    const hash = crypto.createHash('md5').update(password).digest('hex'); // Weak hashing algorithm
    res.send(`MD5 Hash: ${hash}`);
});

// Insecure file access
app.get('/file', (req, res) => {
    const filename = req.query.name;
    fs.readFile(filename, 'utf8', (err, data) => { // No path validation
        if (err) return res.send('Error reading file');
        res.send(data);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
