const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLoyaltyTiers() {
  console.log('Testing Loyalty Tier Implementation...\n');

  // Fetch all loyalty tiers
  const tiers = await prisma.loyaltyTier.findMany({
    orderBy: { minPoints: 'asc' }
  });
  
  console.log('Loyalty Tiers:');
  tiers.forEach(tier => {
    console.log(`- ${tier.name}: ${tier.minPoints}+ points, ${tier.pointsMultiplier}x multiplier`);
  });
  
  console.log('\n');
  
  // Test customer tier calculation
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      loyaltyPoints: true,
      loyaltyTier: true,
      pointsMultiplier: true
    }
  });
  
  console.log('Customer Tier Assignments:');
  customers.forEach(customer => {
    console.log(`- ${customer.firstName} ${customer.lastName}: ${customer.loyaltyPoints} points -> ${customer.loyaltyTier} tier (${customer.pointsMultiplier}x)`);
  });
  
  console.log('\nTest completed successfully!');
}

testLoyaltyTiers()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });