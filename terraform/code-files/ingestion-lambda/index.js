const mysql = require('mysql2/promise');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

// Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

const sqsClient = new SQSClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  requestHandler: {
    connectionTimeout: 3000, // 3 seconds
    socketTimeout: 3000
  }
});

exports.handler = async (event) => {
  console.log("--- Execution Started ---");
  
  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, inquiry } = body;

    if (!name || !email || !inquiry) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    // 1. Database Operations
    await pool.execute('INSERT IGNORE INTO customer (name, email) VALUES (?, ?)', [name, email]);
    const [rows] = await pool.execute('SELECT id FROM customer WHERE email = ?', [email]);
    const customerId = rows[0].id;

    await pool.execute(
      'INSERT INTO inquiry (customer_id, message, ai_response) VALUES (?, ?, ?)',
      [customerId, inquiry, "AI Response Pending..."]
    );
    console.log("Database updated successfully.");

    // 2. Forward to SQS for AI processing
    const sqsPayload = {
        queueUrl: process.env.SQS_QUEUE_URL,
        message: {
            email,
            inquiry,
            timestamp: new Date().toISOString()
        }
    };

    console.log("Sending to SQS...");
    await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(sqsPayload.message),
    }));
    console.log("Forwarded to SQS successfully.");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Success" })
    };

  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
};