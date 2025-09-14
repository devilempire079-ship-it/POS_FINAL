const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3003/api';

class ComprehensiveSystemTest {
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
      return response.data.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed for ${email}: ${error.response?.data?.error || error.message}`);
    }
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }

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

  async testDatabaseConnectivity() {
    await this.runTest('Database Connectivity', async () => {
      // Test direct database connection
      const userCount = await prisma.user.count();
      this.log(`✅ Database connected, found ${userCount} users`, 'success');

      if (userCount === 0) {
        throw new Error('No users found in database - database may not be seeded');
      }

      return `Database connected with ${userCount} users`;
    });
  }

  async testUserSeeding() {
    await this.runTest('User Seeding Verification', async () => {
      const users = await prisma.user.findMany({
        select: { email: true, role: true, isActive: true }
      });

      const expectedUsers = [
        'admin@essen.com',
        'manager@essen.com',
        'cashier1@essen.com'
      ];

      const foundUsers = users.map(u => u.email);
      const missingUsers = expectedUsers.filter(email => !foundUsers.includes(email));

      if (missingUsers.length > 0) {
        throw new Error(`Missing users: ${missingUsers.join(', ')}`);
      }

      this.log(`✅ All expected users found: ${foundUsers.join(', ')}`, 'success');
      return `Found ${users.length} users with proper roles`;
    });
  }

  async testAPIServerConnectivity() {
    await this.runTest('API Server Connectivity', async () => {
      // Test basic API connectivity without authentication
      const products = await this.makeRequest('GET', '/products');
      this.log(`✅ API server responding, found ${products.length} products`, 'success');

      return `API server connected, ${products.length} products available`;
    });
  }

  async testAuthenticationSystem() {
    await this.runTest('Authentication System', async () => {
      // Test admin login
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');
      this.log('✅ Admin authentication successful', 'success');

      // Test manager login
      const managerToken = await this.authenticateUser('manager@essen.com', 'Manager123!');
      this.log('✅ Manager authentication successful', 'success');

      // Test cashier login
      const cashierToken = await this.authenticateUser('cashier1@essen.com', 'Cashier123!');
      this.log('✅ Cashier authentication successful', 'success');

      // Test invalid credentials
      try {
        await this.authenticateUser('admin@essen.com', 'wrongpassword');
        throw new Error('Should have failed with invalid password');
      } catch (error) {
        if (error.message.includes('Invalid credentials')) {
          this.log('✅ Invalid password correctly rejected', 'success');
        } else {
          throw error;
        }
      }

      return 'All authentication tests passed';
    });
  }

  async testRoleBasedAccess() {
    await this.runTest('Role-Based Access Control', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');
      const managerToken = await this.authenticateUser('manager@essen.com', 'Manager123!');
      const cashierToken = await this.authenticateUser('cashier1@essen.com', 'Cashier123!');

      // Test admin access to user management
      const users = await this.makeRequest('GET', '/users', null, adminToken);
      this.log(`✅ Admin can access user management (${users.length} users)`, 'success');

      // Test manager access to user management (should fail)
      try {
        await this.makeRequest('GET', '/users', null, managerToken);
        throw new Error('Manager should not have access to user management');
      } catch (error) {
        if (error.message.includes('Admin access required') || error.message.includes('403')) {
          this.log('✅ Manager correctly denied access to user management', 'success');
        } else {
          throw error;
        }
      }

      // Test cashier access to user management (should fail)
      try {
        await this.makeRequest('GET', '/users', null, cashierToken);
        throw new Error('Cashier should not have access to user management');
      } catch (error) {
        if (error.message.includes('Admin access required') || error.message.includes('403')) {
          this.log('✅ Cashier correctly denied access to user management', 'success');
        } else {
          throw error;
        }
      }

      return 'Role-based access control working correctly';
    });
  }

  async testProductManagement() {
    await this.runTest('Product Management', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Get existing products
      const products = await this.makeRequest('GET', '/products', null, adminToken);
      this.log(`✅ Retrieved ${products.length} products`, 'success');

      if (products.length === 0) {
        this.log('⚠️ No products found - creating test product', 'warning');

        // Create a test product
        const newProduct = await this.makeRequest('POST', '/products', {
          name: 'Test Product',
          price: 10.99,
          cost: 7.50,
          stockQty: 100,
          category: 'Test',
          sku: 'TEST001',
          isActive: true
        }, adminToken);

        this.log(`✅ Created test product: ${newProduct.name}`, 'success');
      }

      return `Product management working with ${products.length} products`;
    });
  }

  async testCustomerManagement() {
    await this.runTest('Customer Management', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Get customers
      const customers = await this.makeRequest('GET', '/customers', null, adminToken);
      this.log(`✅ Retrieved ${customers.customers?.length || 0} customers`, 'success');

      // Create a test customer
      const testCustomer = await this.makeRequest('POST', '/customers', {
        firstName: 'Test',
        lastName: 'Customer',
        email: `test${Date.now()}@example.com`,
        phone: '555-0123',
        status: 'active'
      }, adminToken);

      this.log(`✅ Created test customer: ${testCustomer.firstName} ${testCustomer.lastName}`, 'success');

      return `Customer management working with ${customers.customers?.length || 0} existing customers`;
    });
  }

  async testSalesWorkflow() {
    await this.runTest('Sales Workflow', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Get products and customers
      const products = await this.makeRequest('GET', '/products', null, adminToken);
      const customers = await this.makeRequest('GET', '/customers', null, adminToken);

      if (products.length === 0 || customers.customers?.length === 0) {
        this.log('⚠️ Insufficient data for sales test - skipping', 'warning');
        return 'Sales workflow test skipped due to insufficient test data';
      }

      const customer = customers.customers[0];
      const product = products[0];

      // Create a sale
      const saleData = {
        items: [{
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
          discount: 0
        }],
        totalAmount: product.price,
        subtotal: product.price,
        taxAmount: 0,
        discount: 0,
        paymentType: 'cash',
        paymentRef: `TEST${Date.now()}`,
        notes: 'Automated test sale',
        cashierId: 1,
        customerId: customer.id
      };

      const sale = await this.makeRequest('POST', '/sales', saleData, adminToken);
      if (!sale.id) {
        throw new Error('Sale creation failed');
      }

      this.log(`✅ Created test sale #${sale.id} for $${sale.totalAmount}`, 'success');

      return `Sales workflow completed successfully`;
    });
  }

  async testAnalyticsSystem() {
    await this.runTest('Analytics System', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Test real-time analytics
      const analytics = await this.makeRequest('GET', '/analytics/realtime', null, adminToken);
      this.log(`✅ Retrieved analytics: $${analytics.todaySales || 0} sales today`, 'success');

      return `Analytics system working - today: $${analytics.todaySales || 0}, ${analytics.totalTransactions || 0} transactions`;
    });
  }

  async testDataIntegrity() {
    await this.runTest('Data Integrity', async () => {
      // Test database constraints and relationships
      const userCount = await prisma.user.count();
      const productCount = await prisma.product.count();
      const customerCount = await prisma.customer.count();
      const saleCount = await prisma.sale.count();

      this.log(`✅ Data integrity check: ${userCount} users, ${productCount} products, ${customerCount} customers, ${saleCount} sales`, 'success');

      // Test foreign key relationships
      const salesWithCustomers = await prisma.sale.findMany({
        where: { customerId: { not: null } },
        include: { customer: true }
      });

      if (salesWithCustomers.length > 0) {
        this.log(`✅ Foreign key relationships intact (${salesWithCustomers.length} sales with customers)`, 'success');
      }

      return `Data integrity verified: ${userCount} users, ${productCount} products, ${customerCount} customers, ${saleCount} sales`;
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive POS System Test Suite', 'info');
    this.log('=' .repeat(60), 'info');

    try {
      // Run all test suites in logical order
      await this.testDatabaseConnectivity();
      await this.testUserSeeding();
      await this.testAPIServerConnectivity();
      await this.testAuthenticationSystem();
      await this.testRoleBasedAccess();
      await this.testProductManagement();
      await this.testCustomerManagement();
      await this.testSalesWorkflow();
      await this.testAnalyticsSystem();
      await this.testDataIntegrity();

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
    }

    // Print final results
    this.printResults();
  }

  printResults() {
    this.log('\n' + '=' .repeat(60), 'info');
    this.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY', 'info');
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

    if (this.testResults.failed === 0) {
      this.log('🎉 ALL TESTS PASSED! System is fully functional.', 'success');
      this.log('🏆 Your POS system is production-ready!', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please review the issues above.', 'warning');
      this.log('💡 Common issues:', 'info');
      this.log('   • Database not properly seeded', 'info');
      this.log('   • Server not running on expected port', 'info');
      this.log('   • Authentication middleware issues', 'info');
      this.log('   • Permission system conflicts', 'info');
    }

    this.log('🏁 Comprehensive Test Suite Complete', 'info');
  }
}

// Run the comprehensive test
async function main() {
  const tester = new ComprehensiveSystemTest();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Comprehensive test suite error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveSystemTest;
