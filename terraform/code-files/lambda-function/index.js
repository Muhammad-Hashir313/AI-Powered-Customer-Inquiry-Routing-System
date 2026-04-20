const mysql = require('mysql2/promise');

// Configuration from Environment Variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000 // 10 seconds timeout for DB connection
});

// Create a console log for if connection established
pool.getConnection()
  .then(connection => {
    console.log("Database connection established successfully.");
    connection.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit the Lambda function if DB connection fails
  });

exports.handler = async (event) => {
  console.log("--- Execution Started ---");
  console.log("Event Received:", JSON.stringify(event, null, 2));

  try {
    // 1. Parse Body
    let body;
    try {
        body = JSON.parse(event.body || "{}");
        console.log("Parsed Body:", body);
    } catch (pe) {
        console.error("JSON Parse Error:", pe.message);
        throw new Error("Invalid JSON format in request body");
    }

    const { name, email, inquiry } = body;

    if (!name || !email || !inquiry) {
        console.warn("Validation Failed: Missing fields", { name, email, inquiry });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing required fields: name, email, or inquiry" })
        };
    }

    // 2. Insert/Ignore Customer
    console.log(`Attempting to insert/find customer: ${email}`);
    await pool.execute(
      'INSERT IGNORE INTO customer (name, email) VALUES (?, ?)',
      [name, email]
    );

    // 3. Get Customer ID
    console.log("Fetching customer ID...");
    const [rows] = await pool.execute('SELECT id FROM customer WHERE email = ?', [email]);
    
    if (rows.length === 0) {
        throw new Error("Customer could not be created or found.");
    }
    const customerId = rows[0].id;
    console.log(`Found Customer ID: ${customerId}`);

    // 4. Insert Inquiry
    console.log("Inserting inquiry into database...");
    await pool.execute(
      'INSERT INTO inquiry (customer_id, message, ai_response) VALUES (?, ?, ?)',
      [customerId, inquiry, "AI Response Pending..."] 
    );

    console.log("Success: Inquiry recorded.");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Success", customerId })
    };

  } catch (error) {
    console.error("--- ERROR LOG ---");
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          error: "Internal Server Error", 
          details: error.message 
      })
    };
  }
};