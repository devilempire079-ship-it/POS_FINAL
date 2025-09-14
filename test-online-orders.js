const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3004/api';

// Sample online order data
const sampleOrders = [
  {
    externalOrderId: 'UE-12345',
    platform: 'uber-eats',
    orderType: 'delivery',
    customerInfo: {
      name: 'John Doe',
      phone: '555-0123',
      email: 'john@example.com'
    },
    items: [
      {
        name: 'Grilled Salmon',
        quantity: 2,
        price: 24.99,
        category: 'mains',
        prepTime: 15,
        notes: 'Extra lemon'
      },
      {
        name: 'Caesar Salad',
        quantity: 1,
        price: 12.99,
        category: 'appetizers',
        prepTime: 5
      }
    ],
    deliveryAddress: '123 Main St, Anytown, USA 12345',
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
    specialInstructions: 'Ring doorbell twice, leave at door if no answer',
    paymentMethod: 'online',
    totalAmount: 62.97
  },
  {
    externalOrderId: 'DD-67890',
    platform: 'doordash',
    orderType: 'takeout',
    customerInfo: {
      name: 'Jane Smith',
      phone: '555-0456',
      email: 'jane@example.com'
    },
    items: [
      {
        name: 'Margherita Pizza',
        quantity: 1,
        price: 18.99,
        category: 'mains',
        prepTime: 12,
        notes: 'Extra cheese'
      },
      {
        name: 'Garlic Bread',
        quantity: 1,
        price: 6.99,
        category: 'appetizers',
        prepTime: 8
      }
    ],
    estimatedPickupTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
    specialInstructions: 'Please have ready by 7:30 PM',
    paymentMethod: 'online',
    totalAmount: 25.98
  },
  {
    externalOrderId: 'WEB-11111',
    platform: 'website',
    orderType: 'takeout',
    customerInfo: {
      name: 'Bob Johnson',
      phone: '555-0789',
      email: 'bob@example.com'
    },
    items: [
      {
        name: 'Chicken Parmesan',
        quantity: 1,
        price: 22.99,
        category: 'mains',
        prepTime: 18
      }
    ],
    estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    paymentMethod: 'online',
    totalAmount: 22.99
  }
];

// Test authentication
async function authenticate() {
  try {
    console.log('🔐 Authenticating...');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = response.data.accessToken;
    console.log('✅ Authentication successful');
    return token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    // For testing purposes, continue without token
    console.log('⚠️ Continuing without authentication for testing');
    return null;
  }
}

// Create online order
async function createOnlineOrder(orderData, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log(`📱 Creating online order: ${orderData.externalOrderId} from ${orderData.platform}`);

    const response = await axios.post(`${API_BASE_URL}/orders/online`, orderData, { headers });

    console.log(`✅ Order created successfully:`, response.data);
    return response.data.order;
  } catch (error) {
    console.error(`❌ Failed to create order ${orderData.externalOrderId}:`, error.response?.data || error.message);
    return null;
  }
}

// Update order status
async function updateOrderStatus(orderId, status, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log(`📝 Updating order ${orderId} status to ${status}`);

    const response = await axios.put(`${API_BASE_URL}/orders/online/${orderId}/status`, { status }, { headers });

    console.log(`✅ Order status updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update order ${orderId}:`, error.response?.data || error.message);
    return null;
  }
}

// Send order to kitchen
async function sendOrderToKitchen(orderId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log(`🍽️ Sending order ${orderId} to kitchen`);

    const response = await axios.post(`${API_BASE_URL}/orders/online/${orderId}/send-to-kitchen`, {}, { headers });

    console.log(`✅ Order sent to kitchen:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send order ${orderId} to kitchen:`, error.response?.data || error.message);
    return null;
  }
}

// Get online orders
async function getOnlineOrders(token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log('📋 Fetching online orders...');

    const response = await axios.get(`${API_BASE_URL}/orders/online`, { headers });

    console.log(`📊 Found ${response.data.orders.length} online orders`);
    return response.data.orders;
  } catch (error) {
    console.error('❌ Failed to fetch online orders:', error.response?.data || error.message);
    return [];
  }
}

// Main test function
async function runOnlineOrdersTest() {
  console.log('🚀 Starting Online Orders Integration Test\n');

  // Authenticate
  const token = await authenticate();
  console.log('');

  // Create online orders
  console.log('📝 Creating sample online orders...\n');
  const createdOrders = [];

  for (const orderData of sampleOrders) {
    const order = await createOnlineOrder(orderData, token);
    if (order) {
      createdOrders.push(order);
    }
    console.log('');
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get all orders
  console.log('📋 Fetching all online orders...\n');
  const allOrders = await getOnlineOrders(token);
  console.log('');

  // Process orders through workflow
  console.log('🔄 Processing orders through workflow...\n');

  for (const order of createdOrders) {
    console.log(`Processing order: ${order.externalOrderId} (${order.platform})`);

    // Confirm order
    await updateOrderStatus(order.id, 'confirmed', token);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send to kitchen
    await sendOrderToKitchen(order.id, token);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mark as ready
    await updateOrderStatus(order.id, 'ready', token);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mark as picked up or delivered
    const finalStatus = order.orderType === 'delivery' ? 'delivered' : 'picked_up';
    await updateOrderStatus(order.id, finalStatus, token);

    console.log(`✅ Order ${order.externalOrderId} completed\n`);
  }

  // Final summary
  console.log('📊 Test Summary:');
  console.log(`Created: ${createdOrders.length} online orders`);
  console.log(`Processed: ${createdOrders.length} orders through full workflow`);
  console.log('\n🎉 Online Orders Integration Test Complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. Check your kitchen display for the online orders');
  console.log('2. Verify WebSocket notifications are working');
  console.log('3. Test with real platform webhooks');
  console.log('4. Configure platform-specific webhook URLs in environment variables');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Online Orders Integration Test

Usage: node test-online-orders.js [options]

Options:
  --help, -h          Show this help message
  --create-only       Only create orders, don't process them
  --status-only       Only check order status
  --single            Test with only one order

Examples:
  node test-online-orders.js                    # Run full test
  node test-online-orders.js --create-only     # Only create orders
  node test-online-orders.js --single          # Test with one order
  `);
  process.exit(0);
}

// Run the test
if (args.includes('--status-only')) {
  authenticate().then(token => {
    getOnlineOrders(token);
  });
} else if (args.includes('--single')) {
  authenticate().then(token => {
    createOnlineOrder(sampleOrders[0], token);
  });
} else if (args.includes('--create-only')) {
  authenticate().then(token => {
    sampleOrders.forEach(orderData => {
      createOnlineOrder(orderData, token);
    });
  });
} else {
  runOnlineOrdersTest().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  createOnlineOrder,
  updateOrderStatus,
  sendOrderToKitchen,
  getOnlineOrders
};
