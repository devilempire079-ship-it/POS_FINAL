const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function main() {
  console.log('🌱 Starting direct SQLite database seed...');

  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  const db = new sqlite3.Database(dbPath);

  try {
    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const hashedManagerPassword = await bcrypt.hash('Manager123!', 10);
    const hashedCashierPassword = await bcrypt.hash('Cashier123!', 10);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await runQuery(db, 'DELETE FROM SaleItem');
    await runQuery(db, 'DELETE FROM Sale');
    await runQuery(db, 'DELETE FROM Customer');
    await runQuery(db, 'DELETE FROM Product');
    await runQuery(db, 'DELETE FROM User');

    // Insert users
    console.log('👤 Creating users...');
    const now = new Date().toISOString();

    await runQuery(db, `
      INSERT INTO User (email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin@essen.com', hashedAdminPassword, 'System Administrator', 'admin', 1, now, now]);

    await runQuery(db, `
      INSERT INTO User (email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['manager@essen.com', hashedManagerPassword, 'Store Manager', 'manager', 1, now, now]);

    await runQuery(db, `
      INSERT INTO User (email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['cashier1@essen.com', hashedCashierPassword, 'Cashier One', 'cashier', 1, now, now]);

    console.log('✅ Created 3 users');

    // Insert products
    console.log('📦 Creating products...');

    await runQuery(db, `
      INSERT INTO Product (name, price, cost, stockQty, category, sku, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Coffee - Premium Arabica', 3.99, 2.50, 50, 'Beverages', 'COFFEE001', 1, now, now]);

    await runQuery(db, `
      INSERT INTO Product (name, price, cost, stockQty, category, sku, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Croissant - Butter', 2.49, 1.25, 25, 'Bakery', 'CROISSANT001', 1, now, now]);

    await runQuery(db, `
      INSERT INTO Product (name, price, cost, stockQty, category, sku, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Sandwich - Turkey Club', 8.99, 4.50, 15, 'Food', 'SANDWICH001', 1, now, now]);

    console.log('✅ Created 3 products');

    // Insert customer
    console.log('👥 Creating customer...');

    await runQuery(db, `
      INSERT INTO Customer (
        firstName, lastName, email, phone, status,
        loyaltyPoints, totalSpent, totalOrders, averageOrderValue,
        registrationDate, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['John', 'Doe', 'john.doe@example.com', '555-0123', 'active', 0, 0, 0, 0, now, now, now]);

    console.log('✅ Created 1 customer');

    // Verify data
    const userCount = await runQuery(db, 'SELECT COUNT(*) as count FROM User');
    const productCount = await runQuery(db, 'SELECT COUNT(*) as count FROM Product');
    const customerCount = await runQuery(db, 'SELECT COUNT(*) as count FROM Customer');

    console.log('🎉 Direct SQLite database seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Users: ${userCount[0].count}`);
    console.log(`   • Products: ${productCount[0].count}`);
    console.log(`   • Customers: ${customerCount[0].count}`);

  } catch (error) {
    console.error('❌ Direct seed failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

main()
  .catch((e) => {
    console.error('❌ Direct seed script failed:', e);
    process.exit(1);
  });
