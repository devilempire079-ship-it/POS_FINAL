const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3000/api';

// Test configuration
const TEST_USERS = {
  admin: { email: 'admin@test.com', password: 'Admin123!', role: 'admin' },
  manager: { email: 'manager@test.com', password: 'Manager123!', role: 'manager' },
  cashier: { email: 'cashier@test.com', password: 'Cashier123!', role: 'cashier' }
};

let authTokens = {};

class POSSystemTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    this.log(`🧪 Running: ${testName}`, 'info');

    try {
      const result = await testFunction();
      this.testResults.passed++;
      this.log(`✅ PASSED: ${testName}`, 'success');
      this.testResults.details.push({ test: testName, status: 'PASSED', result });
      return result;
    } catch (error) {
      this.testResults.failed++;
      this.log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
      this.testResults.details.push({ test: testName, status: 'FAILED', error: error.message });
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { accessToken } = response.data;
      authTokens[email] = accessToken;
      return accessToken;
    } catch (error) {
      throw new Error(`Authentication failed for ${email}: ${error.response?.data?.error || error.message}`);
    }
  }

  async makeAuthenticatedRequest(method, endpoint, data = null, userEmail = 'admin@test.com') {
    const token = authTokens[userEmail];
    if (!token) {
      throw new Error(`No authentication token for ${userEmail}`);
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      const response = await axios({
        method,
        url: `${API_BASE}${endpoint}`,
        data,
        ...config
      });
      return response.data;
    } catch (error) {
      throw new Error(`Request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async setupTestData() {
    this.log('🔧 Setting up test data...', 'info');

    // Create test users
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (!existingUser) {
          const hashedPassword = await require('./security').hashPassword(userData.password);
          await prisma.user.create({
            data: {
              email: userData.email,
              password: hashedPassword,
              name: key.charAt(0).toUpperCase() + key.slice(1),
              role: userData.role,
              isActive: true
            }
          });
          this.log(`Created test user: ${userData.email}`, 'success');
        }
      } catch (error) {
        this.log(`Error creating user ${userData.email}: ${error.message}`, 'warning');
      }
    }

    // Create test products
    const testProducts = [
      { name: 'Test Product 1', price: 10.99, cost: 7.50, stockQty: 100, category: 'Test' },
      { name: 'Test Product 2', price: 25.50, cost: 18.00, stockQty: 50, category: 'Test' },
      { name: 'Test Product 3', price: 5.99, cost: 3.25, stockQty: 200, category: 'Test' }
    ];

    for (const product of testProducts) {
      try {
        const existingProduct = await prisma.product.findFirst({
          where: { name: product.name }
        });

        if (!existingProduct) {
          await prisma.product.create({
            data: {
              ...product,
              sku: `TEST${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              isActive: true
            }
          });
        }
      } catch (error) {
        this.log(`Error creating product ${product.name}: ${error.message}`, 'warning');
      }
    }

    // Create test customer
    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: { email: 'test@example.com' }
      });

      if (!existingCustomer) {
        await prisma.customer.create({
          data: {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phone: '555-0123',
            loyaltyPoints: 100,
            totalSpent: 150.00,
            totalOrders: 3,
            status: 'active'
          }
        });
      }
    } catch (error) {
      this.log(`Error creating test customer: ${error.message}`, 'warning');
    }

    this.log('✅ Test data setup complete', 'success');
  }

  async testAuthentication() {
    await this.runTest('User Authentication', async () => {
      // Test admin login
      await this.authenticateUser(TEST_USERS.admin.email, TEST_USERS.admin.password);
      this.log('Admin authentication successful', 'success');

      // Test manager login
      await this.authenticateUser(TEST_USERS.manager.email, TEST_USERS.manager.password);
      this.log('Manager authentication successful', 'success');

      // Test cashier login
      await this.authenticateUser(TEST_USERS.cashier.email, TEST_USERS.cashier.password);
      this.log('Cashier authentication successful', 'success');

      return 'All user authentications successful';
    });
  }

  async testPermissionSystem() {
    await this.runTest('Permission System', async () => {
      // Test permission templates endpoint
      const templates = await this.makeAuthenticatedRequest('GET', '/permissions/templates');
      if (!templates || templates.length === 0) {
        throw new Error('No permission templates found');
      }
      this.log(`Found ${templates.length} permission templates`, 'success');

      // Test user permissions endpoint
      const users = await this.makeAuthenticatedRequest('GET', '/api/users');
      if (!users || users.length === 0) {
        throw new Error('No users found');
      }

      const firstUser = users[0];
      const userPermissions = await this.makeAuthenticatedRequest('GET', `/api/users/${firstUser.id}/permissions`);
      this.log(`Retrieved permissions for user ${firstUser.name}`, 'success');

      return 'Permission system working correctly';
    });
  }

  async testProductManagement() {
    await this.runTest('Product Management', async () => {
      // Test getting products
      const products = await this.makeAuthenticatedRequest('GET', '/api/products');
      if (!products || products.length === 0) {
        throw new Error('No products found');
      }
      this.log(`Found ${products.length} products`, 'success');

      // Test product search
      const searchResults = await this.makeAuthenticatedRequest('GET', '/api/products/search?q=Test');
      this.log(`Search returned ${searchResults.length} products`, 'success');

      // Test creating a new product
      const newProduct = {
        name: `Test Product ${Date.now()}`,
        price: 15.99,
        cost: 10.50,
        stockQty: 75,
        category: 'Test',
        sku: `TEST${Date.now()}`,
        isActive: true
      };

      const createdProduct = await this.makeAuthenticatedRequest('POST', '/api/products', newProduct);
      if (!createdProduct.id) {
        throw new Error('Product creation failed');
      }
      this.log(`Created product: ${createdProduct.name}`, 'success');

      // Test updating the product
      const updatedProduct = await this.makeAuthenticatedRequest('PUT', `/api/products/${createdProduct.id}`, {
        ...createdProduct,
        price: 16.99
      });
      if (updatedProduct.price !== 16.99) {
        throw new Error('Product update failed');
      }
      this.log(`Updated product price to ${updatedProduct.price}`, 'success');

      return 'Product management working correctly';
    });
  }

  async testCustomerManagement() {
    await this.runTest('Customer Management', async () => {
      // Test getting customers
      const customers = await this.makeAuthenticatedRequest('GET', '/api/customers');
      if (!customers.customers || customers.customers.length === 0) {
        throw new Error('No customers found');
      }
      this.log(`Found ${customers.customers.length} customers`, 'success');

      // Test customer search
      const searchResults = await this.makeAuthenticatedRequest('GET', '/api/customers/search?query=Test');
      this.log(`Customer search returned ${searchResults.customers.length} results`, 'success');

      // Test creating a new customer
      const newCustomer = {
        firstName: 'New',
        lastName: `Customer${Date.now()}`,
        email: `new${Date.now()}@example.com`,
        phone: '555-9999',
        status: 'active'
      };

      const createdCustomer = await this.makeAuthenticatedRequest('POST', '/api/customers', newCustomer);
      if (!createdCustomer.id) {
        throw new Error('Customer creation failed');
      }
      this.log(`Created customer: ${createdCustomer.firstName} ${createdCustomer.lastName}`, 'success');

      // Test updating the customer
      const updatedCustomer = await this.makeAuthenticatedRequest('PUT', `/api/customers/${createdCustomer.id}`, {
        ...createdCustomer,
        phone: '555-8888'
      });
      if (updatedCustomer.phone !== '555-8888') {
        throw new Error('Customer update failed');
      }
      this.log(`Updated customer phone to ${updatedCustomer.phone}`, 'success');

      return 'Customer management working correctly';
    });
  }

  async testSalesWorkflow() {
    await this.runTest('Sales Workflow', async () => {
      // Get products for sale
      const products = await this.makeAuthenticatedRequest('GET', '/api/products');
      if (products.length < 2) {
        throw new Error('Need at least 2 products for sales test');
      }

      // Get customers
      const customers = await this.makeAuthenticatedRequest('GET', '/api/customers');
      const customer = customers.customers[0];

      // Create a sale
      const saleData = {
        items: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: products[0].price,
            totalPrice: products[0].price * 2,
            discount: 0
          },
          {
            productId: products[1].id,
            quantity: 1,
            unitPrice: products[1].price,
            totalPrice: products[1].price,
            discount: 0
          }
        ],
        totalAmount: (products[0].price * 2) + products[1].price,
        subtotal: (products[0].price * 2) + products[1].price,
        taxAmount: 0,
        discount: 0,
        paymentType: 'cash',
        paymentRef: `TEST${Date.now()}`,
        notes: 'Test sale',
        cashierId: 1, // Assuming admin user has ID 1
        customerId: customer.id
      };

      const sale = await this.makeAuthenticatedRequest('POST', '/api/sales', saleData);
      if (!sale.id) {
        throw new Error('Sale creation failed');
      }
      this.log(`Created sale #${sale.id} for $${sale.totalAmount}`, 'success');

      // Test loyalty points earning
      const loyaltyResult = await this.makeAuthenticatedRequest('POST', '/api/loyalty/earn', {
        customerId: customer.id,
        saleId: sale.id,
        amount: sale.totalAmount
      });
      this.log(`Earned ${loyaltyResult.pointsEarned} loyalty points`, 'success');

      return 'Sales workflow completed successfully';
    });
  }

  async testLoyaltySystem() {
    await this.runTest('Loyalty System', async () => {
      // Get customers
      const customers = await this.makeAuthenticatedRequest('GET', '/api/customers');
      const customer = customers.customers[0];

      // Test loyalty transactions
      const transactions = await this.makeAuthenticatedRequest('GET', `/api/loyalty/transactions/${customer.id}`);
      this.log(`Found ${transactions.length} loyalty transactions`, 'success');

      // Test loyalty tiers
      const tiers = await this.makeAuthenticatedRequest('GET', '/api/loyalty/tiers');
      this.log(`Found ${tiers.length} loyalty tiers`, 'success');

      // Test redeeming points
      if (customer.loyaltyPoints >= 20) {
        const redeemResult = await this.makeAuthenticatedRequest('POST', '/api/loyalty/redeem', {
          customerId: customer.id,
          pointsToRedeem: 20
        });
        this.log(`Redeemed points for $${redeemResult.redeemableAmount}`, 'success');
      } else {
        this.log('Not enough points for redemption test', 'warning');
      }

      return 'Loyalty system working correctly';
    });
  }

  async testInventoryManagement() {
    await this.runTest('Inventory Management', async () => {
      // Test stock levels
      const stockLevels = await this.makeAuthenticatedRequest('GET', '/api/inventory/stock');
      this.log(`Retrieved stock levels for ${stockLevels.length} products`, 'success');

      // Test inventory adjustments
      const products = await this.makeAuthenticatedRequest('GET', '/api/inventory');
      if (products.length > 0) {
        const testProduct = products[0];
        const adjustment = await this.makeAuthenticatedRequest('POST', '/api/inventory/adjustment', {
          productId: testProduct.id,
          adjustmentType: 'increase',
          quantity: 10,
          reason: 'Test adjustment',
          performedBy: 1
        });
        this.log(`Created inventory adjustment for ${testProduct.name}`, 'success');
      }

      return 'Inventory management working correctly';
    });
  }

  async testReportsAndAnalytics() {
    await this.runTest('Reports and Analytics', async () => {
      // Test real-time analytics
      const analytics = await this.makeAuthenticatedRequest('GET', '/api/analytics/realtime');
      this.log(`Retrieved real-time analytics: ${analytics.todaySales} sales today`, 'success');

      // Test customer analytics
      const customerAnalytics = await this.makeAuthenticatedRequest('GET', '/api/customers/analytics/overview');
      this.log(`Retrieved customer analytics for ${customerAnalytics.overview.totalCustomers} customers`, 'success');

      return 'Reports and analytics working correctly';
    });
  }

  async testUserManagement() {
    await this.runTest('User Management', async () => {
      // Test getting users (admin only)
      const users = await this.makeAuthenticatedRequest('GET', '/api/users');
      this.log(`Found ${users.length} users in system`, 'success');

      // Test creating a new user
      const newUser = {
        email: `testuser${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Test User',
        role: 'cashier'
      };

      const createdUser = await this.makeAuthenticatedRequest('POST', '/api/users', newUser);
      if (!createdUser.id) {
        throw new Error('User creation failed');
      }
      this.log(`Created new user: ${createdUser.name}`, 'success');

      return 'User management working correctly';
    });
  }

  async testPermissionWorkflow() {
    await this.runTest('Permission Workflow', async () => {
      // Get permission templates
      const templates = await this.makeAuthenticatedRequest('GET', '/permissions/templates');

      // Assign a template to a user
      const users = await this.makeAuthenticatedRequest('GET', '/api/users');
      const testUser = users.find(u => u.email.includes('testuser'));

      if (testUser && templates.length > 0) {
        const assignment = await this.makeAuthenticatedRequest('POST', `/api/users/${testUser.id}/assign-template`, {
          templateId: templates[0].id
        });
        this.log(`Assigned permission template to user ${testUser.name}`, 'success');

        // Get user permissions
        const userPermissions = await this.makeAuthenticatedRequest('GET', `/api/users/${testUser.id}/permissions`);
        this.log(`Retrieved ${userPermissions.length} permissions for user`, 'success');
      }

      return 'Permission workflow working correctly';
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive POS System Test Suite', 'info');
    this.log('=' .repeat(60), 'info');

    try {
      // Setup test data
      await this.setupTestData();

      // Run all test suites
      await this.testAuthentication();
      await this.testPermissionSystem();
      await this.testProductManagement();
      await this.testCustomerManagement();
      await this.testSalesWorkflow();
      await this.testLoyaltySystem();
      await this.testInventoryManagement();
      await this.testReportsAndAnalytics();
      await this.testUserManagement();
      await this.testPermissionWorkflow();

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
    }

    // Print final results
    this.printResults();
  }

  printResults() {
    this.log('\n' + '=' .repeat(60), 'info');
    this.log('📊 TEST RESULTS SUMMARY', 'info');
    this.log('=' .repeat(60), 'info');

    this.log(`Total Tests: ${this.testResults.total}`, 'info');
    this.log(`Passed: ${this.testResults.passed}`, 'success');
    this.log(`Failed: ${this.testResults.failed}`, 'error');

    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    this.log(`Success Rate: ${successRate}%`, this.testResults.failed === 0 ? 'success' : 'warning');

    if (this.testResults.failed > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  • ${test.test}: ${test.error}`, 'error');
        });
    }

    this.log('\n✅ PASSED TESTS:', 'success');
    this.testResults.details
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        this.log(`  • ${test.test}`, 'success');
      });

    this.log('\n' + '=' .repeat(60), 'info');
    this.log('🏁 Test Suite Complete', 'info');
  }
}

// Run the tests
async function main() {
  const tester = new POSSystemTester();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  }
}

if (require.main === module) {
  main();
}

module.exports = POSSystemTester;
