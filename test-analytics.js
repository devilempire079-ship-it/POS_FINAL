const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealTimeAnalytics() {
  console.log('Testing Real-Time Analytics...\n');

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's sales metrics
    const [todaySales, totalTransactions, activeCustomers, topProducts] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.sale.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.sale.groupBy({
        by: ['customerId'],
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          customerId: {
            not: null
          }
        }
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ]);
    
    console.log('📊 Real-Time Analytics Data:');
    console.log(`Today's Sales: $${(todaySales._sum.totalAmount || 0).toFixed(2)}`);
    console.log(`Total Transactions: ${totalTransactions}`);
    console.log(`Active Customers: ${activeCustomers.length}`);
    
    console.log('\n🏆 Top Products Today:');
    if (topProducts.length > 0) {
      // Get product details for top products
      const productIds = topProducts.map(tp => tp.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: {
          id: true,
          name: true
        }
      });
      
      const productMap = {};
      products.forEach(p => productMap[p.id] = p.name);
      
      topProducts.forEach((tp, index) => {
        const productName = productMap[tp.productId] || `Product ${tp.productId}`;
        console.log(`${index + 1}. ${productName}: ${tp._sum.quantity} units sold`);
      });
    } else {
      console.log('No products sold today');
    }
    
    console.log('\n✅ Real-time analytics test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing real-time analytics:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRealTimeAnalytics();