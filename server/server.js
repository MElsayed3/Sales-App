const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const cors = require('cors'); // NEW: Import CORS for cross-origin communication

const app = express();

// --- Middleware Setup ---
app.use(cors()); // NEW: Enable all CORS requests
app.use(bodyParser.urlencoded({ extended: true }));

// NEW: This is CRUCIAL for Express to parse incoming JSON data from the client
app.use(express.json()); 

// REMOVED: app.use(express.static('views')); // Not needed for API server

// --- API Routes ---

// NEW: Main route to get ALL data as JSON
app.get('/api/data', async (req, res) => {
    try {
        const customers = await pool.query('SELECT * FROM Customers ORDER BY CustomerID DESC');
        const products = await pool.query('SELECT * FROM Products ORDER BY ProductID DESC');
        
        // Use COALESCE to handle potential NULL values gracefully
        const orders = await pool.query(`
            SELECT 
                o.OrderID, 
                COALESCE(c.FirstName, '') || ' ' || COALESCE(c.LastName, '') AS CustomerName, 
                o.TotalAmount, 
                o.OrderDate
            FROM Orders o
            LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
            ORDER BY o.OrderID DESC
        `);

        // Send a single JSON object containing all data sets
        res.json({ 
            customers: customers.rows,
            products: products.rows,
            orders: orders.rows
        });
        
    } catch (err) {
        console.error("Database Query Error:", err.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// adding customer
app.post('/add-customer', async (req, res) => {
    // Note: This still handles HTML form data via bodyParser.urlencoded
    // We will update this route next to handle JSON data
    const { FirstName, LastName, Email, Phone } = req.body;
    try {
        await pool.query(
            'INSERT INTO Customers (FirstName, LastName, Email, Phone) VALUES ($1, $2, $3, $4)',
            [FirstName, LastName, Email, Phone]
        );
        // Change from res.redirect('/') to sending a JSON success response
        res.status(201).json({ message: 'Customer added successfully!' });
    } catch (err) {
        console.error("Error adding customer:", err.message);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});

// adding product
app.post('/add-product', async (req, res) => {
    const { ProductName, UnitPrice, StockQuantity } = req.body;
    try {
        await pool.query(
            'INSERT INTO Products (ProductName, UnitPrice, StockQuantity) VALUES ($1, $2, $3)',
            [ProductName, UnitPrice, StockQuantity]
        );
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (err) {
        console.error("Error adding product:", err.message);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// adding order
app.post('/add-order', async (req, res) => {
    const { CustomerID, TotalAmount } = req.body;
    try {
        await pool.query(
            'INSERT INTO Orders (CustomerID, TotalAmount) VALUES ($1, $2)',
            [CustomerID, TotalAmount]
        );
        res.status(201).json({ message: 'Order added successfully!' });
    } catch (err) {
        console.error("Error adding order:", err.message);
        res.status(500).json({ error: 'Failed to add order' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));