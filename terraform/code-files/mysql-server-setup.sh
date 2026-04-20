#!/bin/bash
set -e

# Install MySQL client
sudo apt update
sudo apt install mysql-client -y

DB_HOST="${db_host}"
DB_USER="hashir"
DB_NAME="mydb"
DB_PASSWORD="${db_password}"

# Wait for RDS to be ready
until mysqladmin ping -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" --silent; do
  echo "Waiting for RDS..."
  sleep 10
done

# Run SQL
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
CREATE TABLE customer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  ai_response TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);
EOF