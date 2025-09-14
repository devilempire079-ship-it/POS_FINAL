const WebSocket = require('ws');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalTest() {
  console.log('🧪 Final Integration Test\n');

  // Connect to WebSocket server
  console.log('Connecting to WebSocket server...');
  const ws = new WebSocket('ws://localhost:3001');

  ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📡 Real-time Update:', message.type);
      console.log('   Data:', JSON.stringify(message.data, null, 2));
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  // Wait for WebSocket connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Check loyalty tiers
  console.log('\n1. Testing Loyalty Tiers...');
  try {
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { minPoints: 'asc' }
    });
    
    console.log('   Available tiers:');
    tiers.forEach(tier => {
      console.log(`   - ${tier.name}: ${tier.minPoints}+ points, ${tier.pointsMultiplier}x multiplier`);
    });
  } catch (error) {
    console.error('   ❌ Error fetching loyalty tiers:', error);
  }

  // Test 2: Check customer tiers
  console.log('\n2. Testing Customer Tiers...');
  try {
    const customers = await prisma.customer.findMany({
      select: {
        firstName: true,
        lastName: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        pointsMultiplier: true
      },
      take: 3
    });
    
    console.log('   Sample customers:');
    customers.forEach(customer => {
      console.log(`   - ${customer.firstName} ${customer.lastName}: ${customer.loyaltyPoints} points -> ${customer.loyaltyTier || 'No tier'} (${customer.pointsMultiplier}x)`);
    });
  } catch (error) {
    console.error('   ❌ Error fetching customers:', error);
  }

  // Test 3: Create a test sale
  console.log('\n3. Testing Sale Creation with Real-time Updates...');
  try {
    // Get a customer and some products
    const customer = await prisma.customer.findFirst();
    const products = await prisma.product.findMany({ take: 2 });
    
    if (customer && products.length >= 2) {
      console.log(`   Creating sale for ${customer.firstName} ${customer.lastName}...`);
      
      // Create a test sale
      const saleItems = products.map(product => ({
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price
      }));
      
      const subtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + tax;
      
      const sale = await prisma.sale.create({
        data: {
          totalAmount,
          subtotal,
          taxAmount: tax,
          paymentType: 'cash',
          customerId: customer.id,
          cashierId: 1, // Admin user
          saleItems: {
            create: saleItems
          }
        },
        include: {
          saleItems: {
            include: {
              product: true
            }
          },
          customer: true,
          cashier: true
        }
      });
      
      console.log(`   ✅ Sale created successfully! ID: ${sale.id}, Amount: $${sale.totalAmount.toFixed(2)}`);
      
      // Wait to see if we get a WebSocket update
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('   ⚠️  No customer or products found');
    }
  } catch (error) {
    console.error('   ❌ Error creating test sale:', error);
  }

  // Clean up
  await new Promise(resolve => setTimeout(resolve, 2000));
  ws.close();
  await prisma.$disconnect();
  
  console.log('\n🏁 Integration test completed!');
}

finalTest();