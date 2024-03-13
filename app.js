
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.');
});


const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const setupDatabase = async () => {
    await dbRun('CREATE TABLE users(name TEXT, creditcardnumber TEXT, expdate TEXT, securitycode TEXT)');
    await dbRun(`INSERT INTO users (name, creditcardnumber, expdate, securitycode) VALUES (?, ?, ?, ?)`, ['demo', 'demo', 'demo', 'demo']);
};

setupDatabase().then(() => {
    console.log('Database setup complete.');
}).catch(err => {
    console.error('Database setup failed:', err);
});

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
        <style>
            body {
                background-color: #f2f2f2;
                font-family: Arial, sans-serif;
            }
            h2 {
                color: #333;
            }
            form {
                max-width: 300px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            label {
                display: block;
                margin-bottom: 10px;
                color: #555;
            }
            input[type="text"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-sizing: border-box;
            }
            input[type="submit"] {
                width: 100%;
                padding: 10px;
                background-color: #4CAF50;
                color: #fff;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <h2>Credit Card Information ($1000)</h2>
        <form action="/login" method="post">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">

            <label for="creditcardnumber">Credit Card Number:</label>
            <input type="text" id="creditcardnumber" name="creditcardnumber">

            <label for="expdate">Expiration Date:</label>
            <input type="text" id="expdate" name="expdate">

            <label for="securitycode">Security Code:</label>
            <input type="text" id="securitycode" name="securitycode">

            <input type="submit" value="Submit">
        </form>
    </body>
    </html>
    `);
});

app.post('/login', (req, res) => {
    let name = req.body.name;
    let creditcardnumber = req.body.creditcardnumber; // Vulnerable to SQL injection
    let expdate = req.body.expdate;
    let securitycode = req.body.securitycode;

    // Deliberately vulnerable SQL query
    let sql = `SELECT * FROM users WHERE name = '${name}' AND creditcardnumber = '${creditcardnumber}' AND expdate = '${expdate}' AND securitycode = '${securitycode}'`;


    db.get(sql, [], (err, row) => {
        if (err) {
            console.error(err.message);
            res.send("An error occurred.");
        } else {
            row ? res.send(`Flag is flag{sql_injection_is_cool}`) : res.send('Incorrect card information.');
        }
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
