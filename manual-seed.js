const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting manual database seed...');

  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    await prisma.$executeRaw`DELETE FROM "SaleItem"`;
    await prisma.$executeRaw`DELETE FROM "Sale"`;
    await prisma.$executeRaw`DELETE FROM "Customer"`;
    await prisma.$executeRaw`DELETE FROM "Product"`;
    await prisma.$executeRaw`DELETE FROM "User"`;

    console.log('👤 Creating users with raw SQL...');

    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const hashedManagerPassword = await bcrypt.hash('Manager123!', 10);
    const hashedCashierPassword = await bcrypt.hash('Cashier123!', 10);

    // Insert users using raw SQL to bypass schema issues
    await prisma.$executeRaw`
      INSERT INTO "User" ("email", "password", "name", "role", "isActive", "createdAt", "updatedAt")
      VALUES
        ('admin@essen.com', ${hashedAdminPassword}, 'System Administrator', 'admin', true, datetime('now'), datetime('now')),
        ('manager@essen.com', ${hashedManagerPassword}, 'Store Manager', 'manager', true, datetime('now'), datetime('now')),
        ('cashier1@essen.com', ${hashedCashierPassword}, 'Cashier One', 'cashier', true, datetime('now'), datetime('now'))
    `;

    console.log('✅ Created users with raw SQL');

    // Create products using raw SQL
    console.log('📦 Creating products with raw SQL...');
    await prisma.$executeRaw`
      INSERT INTO "Product" ("name", "price", "cost", "stockQty", "category", "sku", "isActive", "createdAt", "updatedAt")
      VALUES
        ('Coffee - Premium Arabica', 3.99, 2.50, 50, 'Beverages', 'COFFEE001', true, datetime('now'), datetime('now')),
        ('Croissant - Butter', 2.49, 1.25, 25, 'Bakery', 'CROISSANT001', true, datetime('now'), datetime('now')),
        ('Sandwich - Turkey Club', 8.99, 4.50, 15, 'Food', 'SANDWICH001', true, datetime('now'), datetime('now'))
    `;

    console.log('✅ Created products with raw SQL');

    // Create customer using raw SQL
    console.log('👥 Creating customer with raw SQL...');
    await prisma.$executeRaw`
      INSERT INTO "Customer" (
        "firstName", "lastName", "email", "phone", "status",
        "loyaltyPoints", "totalSpent", "totalOrders", "averageOrderValue",
        "registrationDate", "createdAt", "updatedAt"
      )
      VALUES (
        'John', 'Doe', 'john.doe@example.com', '555-0123', 'active',
        0, 0, 0, 0, datetime('now'), datetime('now'), datetime('now')
      )
    `;

    console.log('✅ Created customer with raw SQL');

    // Verify the data was inserted
    const userCount = await prisma.$executeRaw`SELECT COUNT(*) as count FROM "User"`;
    const productCount = await prisma.$executeRaw`SELECT COUNT(*) as count FROM "Product"`;
    const customerCount = await prisma.$executeRaw`SELECT COUNT(*) as count FROM "Customer"`;

    console.log('🎉 Manual database seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Users created: ${JSON.stringify(userCount)}`);
    console.log(`   • Products created: ${JSON.stringify(productCount)}`);
    console.log(`   • Customers created: ${JSON.stringify(customerCount)}`);

  } catch (error) {
    console.error('❌ Manual seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Manual seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
