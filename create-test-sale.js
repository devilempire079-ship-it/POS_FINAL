const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestSale() {
  console.log('Creating test sale...\n');

  try {
    // Get a customer and some products
    const customer = await prisma.customer.findFirst();
    const products = await prisma.product.findMany({ take: 3 });
    
    if (!customer || products.length === 0) {
      console.log('❌ No customer or products found. Please seed the database first.');
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
        customer: true
      }
    });
    
    console.log(`\n✅ Sale created successfully!`);
    console.log(`Sale ID: ${sale.id}`);
    console.log(`Total Amount: $${sale.totalAmount.toFixed(2)}`);
    console.log(`Customer: ${sale.customer.firstName} ${sale.customer.lastName}`);
    console.log(`Loyalty Points Before: ${sale.customer.loyaltyPoints}`);
    
    // Test loyalty points earning
    const basePoints = Math.floor(subtotal / 10);
    const pointsMultiplier = sale.customer.pointsMultiplier || 1.0;
    const pointsEarned = Math.floor(basePoints * pointsMultiplier);
    
    console.log(`\n🏆 Loyalty Points Calculation:`);
    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`Base Points (1 per $10): ${basePoints}`);
    console.log(`Tier Multiplier: ${pointsMultiplier}x`);
    console.log(`Points Earned: ${pointsEarned}`);
    
    // Update customer with earned points
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        loyaltyPoints: { increment: pointsEarned },
        totalSpent: { increment: subtotal },
        totalOrders: { increment: 1 },
        lastVisit: new Date()
      }
    });
    
    console.log(`\n🎉 Customer updated!`);
    console.log(`New Loyalty Points: ${updatedCustomer.loyaltyPoints}`);
    console.log(`Total Spent: $${updatedCustomer.totalSpent.toFixed(2)}`);
    console.log(`Total Orders: ${updatedCustomer.totalOrders}`);
    
  } catch (error) {
    console.error('❌ Error creating test sale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSale();