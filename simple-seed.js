const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  try {
    // Create basic users
    console.log('👤 Creating users...');

    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const hashedManagerPassword = await bcrypt.hash('Manager123!', 10);
    const hashedCashierPassword = await bcrypt.hash('Cashier123!', 10);

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@essen.com' },
      update: {},
      create: {
        email: 'admin@essen.com',
        password: hashedAdminPassword,
        name: 'System Administrator',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create manager user
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@essen.com' },
      update: {},
      create: {
        email: 'manager@essen.com',
        password: hashedManagerPassword,
        name: 'Store Manager',
        role: 'manager',
        isActive: true
      }
    });
    console.log('✅ Created manager user:', managerUser.email);

    // Create cashier user
    const cashierUser = await prisma.user.upsert({
      where: { email: 'cashier1@essen.com' },
      update: {},
      create: {
        email: 'cashier1@essen.com',
        password: hashedCashierPassword,
        name: 'Cashier One',
        role: 'cashier',
        isActive: true
      }
    });
    console.log('✅ Created cashier user:', cashierUser.email);

    // Create some basic products
    console.log('📦 Creating sample products...');

    const products = [
      {
        name: 'Coffee - Premium Arabica',
        price: 3.99,
        cost: 2.50,
        stockQty: 50,
        category: 'Beverages',
        sku: 'COFFEE001',
        isActive: true
      },
      {
        name: 'Croissant - Butter',
        price: 2.49,
        cost: 1.25,
        stockQty: 25,
        category: 'Bakery',
        sku: 'CROISSANT001',
        isActive: true
      },
      {
        name: 'Sandwich - Turkey Club',
        price: 8.99,
        cost: 4.50,
        stockQty: 15,
        category: 'Food',
        sku: 'SANDWICH001',
        isActive: true
      }
    ];

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {},
        create: productData
      });
      console.log('✅ Created product:', product.name);
    }

    // Create a sample customer
    console.log('👥 Creating sample customer...');

    const customer = await prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123',
        status: 'active',
        loyaltyPoints: 0,
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        registrationDate: new Date()
      }
    });
    console.log('✅ Created customer:', `${customer.firstName} ${customer.lastName}`);

    console.log('🎉 Simple database seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • ${3} users created`);
    console.log(`   • ${products.length} products created`);
    console.log(`   • ${1} customer created`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
