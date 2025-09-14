const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./security');

const prisma = new PrismaClient();

async function resetTestPasswords() {
  console.log('🔑 Resetting test user passwords...\n');

  const testUsers = [
    { email: 'admin@test.com', password: 'Admin123!', name: 'Admin', role: 'admin' },
    { email: 'manager@test.com', password: 'Manager123!', name: 'Manager', role: 'manager' },
    { email: 'cashier@test.com', password: 'Cashier123!', name: 'Cashier', role: 'cashier' }
  ];

  for (const userData of testUsers) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        // Update password
        const hashedPassword = await hashPassword(userData.password);
        await prisma.user.update({
          where: { email: userData.email },
          data: { password: hashedPassword }
        });
        console.log(`✅ Updated password for ${userData.email}`);
      } else {
        // Create user
        const hashedPassword = await hashPassword(userData.password);
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            isActive: true
          }
        });
        console.log(`✅ Created user ${userData.email}`);
      }
    } catch (error) {
      console.error(`❌ Error with ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Password reset complete!');
  console.log('\nTest Credentials:');
  console.log('Admin: admin@test.com / Admin123!');
  console.log('Manager: manager@test.com / Manager123!');
  console.log('Cashier: cashier@test.com / Cashier123!');
}

resetTestPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
