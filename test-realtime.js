const WebSocket = require('ws');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealTimeUpdates() {
  console.log('Testing real-time updates with WebSocket...\n');

  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3001');

  ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');
    console.log('Listening for real-time updates...\n');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📡 Real-time Update Received:');
      console.log(JSON.stringify(message, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // Wait a moment for WebSocket connection to establish
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create a test sale
  console.log('Creating test sale...\n');
  
  try {
    // Get a customer and some products
    const customer = await prisma.customer.findFirst();
    const products = await prisma.product.findMany({ take: 2 });
    
    if (!customer || products.length === 0) {
      console.log('❌ No customer or products found. Please seed the database first.');
      ws.close();
      return;
    }
    
    console.log(`Customer: ${customer.firstName} ${customer.lastName}`);
    console.log('Products:');
    products.forEach(p => console.log(`- ${p.name}: $${p.price.toFixed(2)}`));
    
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
    
    console.log(`\n✅ Sale created successfully!`);
    console.log(`Sale ID: ${sale.id}`);
    console.log(`Total Amount: $${sale.totalAmount.toFixed(2)}`);
    console.log(`Customer: ${sale.customer.firstName} ${sale.customer.lastName}`);
    
    // Wait a few seconds to receive WebSocket updates
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ Error creating test sale:', error);
  } finally {
    await prisma.$disconnect();
    ws.close();
    console.log('Test completed.');
  }
}

testRealTimeUpdates();