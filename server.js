/**
 * Simple Node.js HTTP server
 *
 * Installation:
 * =============
 * Install Node.js and navigate to this directory.
 * Run npm install && clear && node server.js to start the server
 * 
 * @license: MIT License
 * @author: Jabran Rafique <jabran@united-agency.co.uk>
 *
 */
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

var app = express();

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'app' directory
app.use(express.static('app'));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

// Create a database connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'employees',
});


// API endpoint to fetch SQL data
app.get('/api/departments', (req, res) => {
    const query = `
        SELECT d.dept_name AS Department, t.title AS Title, COUNT(*) AS Count
        FROM employees e
        JOIN dept_emp de ON e.emp_no = de.emp_no
        JOIN departments d ON de.dept_no = d.dept_no
        JOIN titles t ON e.emp_no = t.emp_no
        WHERE d.dept_name = 'Customer Service' OR d.dept_name = 'Development'
        GROUP BY d.dept_name, t.title
        ORDER BY d.dept_name, t.title;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            res.json(results); // Send results as JSON
        }
    });
});


console.log('Server started at http://localhost:3000');