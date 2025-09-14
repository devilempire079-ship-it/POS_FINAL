const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllCustomerTiers() {
  console.log('Updating customer loyalty tiers...\n');

  try {
    // Get all active loyalty tiers ordered by minPoints descending
    const tiers = await prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'desc' }
    });
    
    console.log('Available tiers:');
    tiers.forEach(tier => {
      console.log(`- ${tier.name}: ${tier.minPoints}+ points, ${tier.pointsMultiplier}x multiplier`);
    });
    
    console.log('\n');
    
    // Get all customers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        loyaltyPoints: true
      }
    });
    
    console.log(`Processing ${customers.length} customers...\n`);
    
    let updatedCount = 0;
    
    for (const customer of customers) {
      // Find the highest tier the customer qualifies for
      const tier = tiers.find(t => customer.loyaltyPoints >= t.minPoints);
      
      // Update customer with tier information
      if (tier) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            loyaltyTier: tier.name,
            pointsMultiplier: tier.pointsMultiplier
          }
        });
        
        console.log(`✅ ${customer.firstName} ${customer.lastName}: ${customer.loyaltyPoints} points -> ${tier.name} tier (${tier.pointsMultiplier}x)`);
        updatedCount++;
      } else {
        // Set to default values if no tier found
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            loyaltyTier: null,
            pointsMultiplier: 1.0
          }
        });
        
        console.log(`ℹ️  ${customer.firstName} ${customer.lastName}: ${customer.loyaltyPoints} points -> No tier (1x)`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} customers with loyalty tiers!`);
    
  } catch (error) {
    console.error('❌ Error updating customer tiers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllCustomerTiers();