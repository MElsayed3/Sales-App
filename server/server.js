const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));

// الصفحة الرئيسية
app.get('/', async (req, res) => {
  try {
    const customers = await pool.query('SELECT * FROM Customers ORDER BY CustomerID DESC');
    const products = await pool.query('SELECT * FROM Products ORDER BY ProductID DESC');
    const orders = await pool.query(`
      SELECT o.OrderID, c.FirstName || ' ' || c.LastName AS CustomerName, o.TotalAmount, o.OrderDate
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
      ORDER BY o.OrderID DESC
    `);

    let html = `
      <html>
      <head>
        <title>Sales Management</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
      </head>
      <body class="p-4">
      <h2 class="mb-3 text-primary">Sales Management System</h2>

      <div class="row">
        <div class="col-md-4">
          <h4>Add Customer</h4>
          <form method="POST" action="/add-customer">
            <input class="form-control mb-2" name="FirstName" placeholder="First Name" required />
            <input class="form-control mb-2" name="LastName" placeholder="Last Name" required />
            <input class="form-control mb-2" name="Email" placeholder="Email" />
            <input class="form-control mb-2" name="Phone" placeholder="Phone" />
            <button class="btn btn-primary w-100">Add Customer</button>
          </form>
        </div>

        <div class="col-md-4">
          <h4>Add Product</h4>
          <form method="POST" action="/add-product">
            <input class="form-control mb-2" name="ProductName" placeholder="Product Name" required />
            <input class="form-control mb-2" name="UnitPrice" type="number" step="0.01" placeholder="Unit Price" required />
            <input class="form-control mb-2" name="StockQuantity" type="number" placeholder="Stock Quantity" required />
            <button class="btn btn-success w-100">Add Product</button>
          </form>
        </div>

        <div class="col-md-4">
          <h4>Add Order</h4>
          <form method="POST" action="/add-order">
            <input class="form-control mb-2" name="CustomerID" type="number" placeholder="Customer ID" required />
            <input class="form-control mb-2" name="TotalAmount" type="number" step="0.01" placeholder="Total Amount" required />
            <button class="btn btn-warning w-100">Add Order</button>
          </form>
        </div>
      </div>

      <hr/>

      <h4>Customers</h4>
      <table class="table table-bordered">
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr>
        ${customers.rows.map(c => `<tr><td>${c.customerid}</td><td>${c.firstname} ${c.lastname}</td><td>${c.email || ''}</td><td>${c.phone || ''}</td></tr>`).join('')}
      </table>

      <h4>Products</h4>
      <table class="table table-bordered">
        <tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th></tr>
        ${products.rows.map(p => `<tr><td>${p.productid}</td><td>${p.productname}</td><td>${p.unitprice}</td><td>${p.stockquantity}</td></tr>`).join('')}
      </table>

      <h4>Orders</h4>
      <table class="table table-bordered">
        <tr><th>ID</th><th>Customer</th><th>Amount</th><th>Date</th></tr>
        ${orders.rows.map(o => `<tr><td>${o.orderid}</td><td>${o.customername}</td><td>${o.totalamount}</td><td>${new Date(o.orderdate).toLocaleString()}</td></tr>`).join('')}
      </table>

      </body></html>
    `;

    res.send(html);
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// إضافة عميل
app.post('/add-customer', async (req, res) => {
  const { FirstName, LastName, Email, Phone } = req.body;
  await pool.query(
    'INSERT INTO Customers (FirstName, LastName, Email, Phone) VALUES ($1, $2, $3, $4)',
    [FirstName, LastName, Email, Phone]
  );
  res.redirect('/');
});

// إضافة منتج
app.post('/add-product', async (req, res) => {
  const { ProductName, UnitPrice, StockQuantity } = req.body;
  await pool.query(
    'INSERT INTO Products (ProductName, UnitPrice, StockQuantity) VALUES ($1, $2, $3)',
    [ProductName, UnitPrice, StockQuantity]
  );
  res.redirect('/');
});

// إضافة طلب
app.post('/add-order', async (req, res) => {
  const { CustomerID, TotalAmount } = req.body;
  await pool.query(
    'INSERT INTO Orders (CustomerID, TotalAmount) VALUES ($1, $2)',
    [CustomerID, TotalAmount]
  );
  res.redirect('/');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
