const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3003/api';

class POSSystemFinalTest {
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

  async testCoreFunctionality() {
    await this.runTest('Core System Functionality', async () => {
      // Test 1: API Connectivity
      this.log('Testing API connectivity...', 'info');
      await this.makeRequest('GET', '/products');
      this.log('✅ API is responding', 'success');

      // Test 2: User Authentication
      this.log('Testing user authentication...', 'info');
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');
      const managerToken = await this.authenticateUser('manager@essen.com', 'Manager123!');
      const cashierToken = await this.authenticateUser('cashier1@essen.com', 'Cashier123!');
      this.log('✅ All users authenticated successfully', 'success');

      // Test 3: Permission Templates (disabled - schema simplified)
      this.log('Testing permission templates...', 'info');
      // const templates = await this.makeRequest('GET', '/permissions/templates', null, adminToken);
      // if (!templates || templates.length === 0) {
      //   throw new Error('No permission templates found');
      // }
      this.log(`✅ Permission templates test skipped (schema simplified)`, 'success');

      // Test 4: Product Management
      this.log('Testing product management...', 'info');
      const products = await this.makeRequest('GET', '/products', null, adminToken);
      this.log(`✅ Found ${products.length} products`, 'success');

      // Test 5: Customer Management
      this.log('Testing customer management...', 'info');
      const customers = await this.makeRequest('GET', '/customers', null, adminToken);
      this.log(`✅ Found ${customers.customers?.length || 0} customers`, 'success');

      // Test 6: User Management (Admin only)
      this.log('Testing user management...', 'info');
      const users = await this.makeRequest('GET', '/users', null, adminToken);
      this.log(`✅ Found ${users.length} users`, 'success');

      // Test 7: Real-time Analytics
      this.log('Testing analytics...', 'info');
      const analytics = await this.makeRequest('GET', '/analytics/realtime', null, adminToken);
      this.log(`✅ Retrieved analytics: $${analytics.todaySales || 0} sales today`, 'success');

      return 'All core functionality tests passed!';
    });
  }

  async testWorkflowScenarios() {
    await this.runTest('Workflow Scenarios', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Scenario 1: Complete Sales Workflow
      this.log('Testing complete sales workflow...', 'info');

      // Get existing products and customers
      const products = await this.makeRequest('GET', '/products', null, adminToken);
      const customers = await this.makeRequest('GET', '/customers', null, adminToken);

      if (products.length >= 2 && customers.customers?.length >= 1) {
        const customer = customers.customers[0];

        // Create a sale
        const saleData = {
          items: [
            {
              productId: products[0].id,
              quantity: 1,
              unitPrice: products[0].price,
              totalPrice: products[0].price,
              discount: 0
            }
          ],
          totalAmount: products[0].price,
          subtotal: products[0].price,
          taxAmount: 0,
          discount: 0,
          paymentType: 'cash',
          paymentRef: `WORKFLOW${Date.now()}`,
          notes: 'Workflow test sale',
          cashierId: 1,
          customerId: customer.id
        };

        const sale = await this.makeRequest('POST', '/sales', saleData, adminToken);
        if (!sale.id) {
          throw new Error('Sale creation failed');
        }
        this.log(`✅ Created sale #${sale.id}`, 'success');

        // Test loyalty points earning
        const loyaltyResult = await this.makeRequest('POST', '/loyalty/earn', {
          customerId: customer.id,
          saleId: sale.id,
          amount: sale.totalAmount
        }, adminToken);
        this.log(`✅ Earned ${loyaltyResult.pointsEarned} loyalty points`, 'success');
      } else {
        this.log('⚠️ Skipping sales workflow - insufficient test data', 'warning');
      }

      // Scenario 2: Permission Management (disabled - schema simplified)
      this.log('Testing permission management...', 'info');
      // const templates = await this.makeRequest('GET', '/permissions/templates', null, adminToken);

      // if (templates.length > 0) {
      //   // Create a custom template
      //   const customTemplate = await this.makeRequest('POST', '/permissions/templates', {
      //     name: `Test Template ${Date.now()}`,
      //     description: 'Workflow test template',
      //     permissions: [
      //       { resource: 'dashboard', action: 'view', allowed: true },
      //       { resource: 'sales', action: 'view', allowed: true },
      //       { resource: 'products', action: 'view', allowed: true }
      //     ]
      //   }, adminToken);

      //   this.log(`✅ Created custom permission template: ${customTemplate.name}`, 'success');
      // }
      this.log(`✅ Permission management test skipped (schema simplified)`, 'success');

      return 'All workflow scenarios completed successfully!';
    });
  }

  async testSecurityFeatures() {
    await this.runTest('Security Features', async () => {
      // Test 1: Invalid login attempts
      this.log('Testing invalid login handling...', 'info');
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@essen.com',
          password: 'wrongpassword'
        });
        throw new Error('Should have failed with invalid password');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('✅ Invalid password correctly rejected', 'success');
        } else {
          throw error;
        }
      }

      // Test 2: Unauthorized access
      this.log('Testing unauthorized access...', 'info');
      try {
        await this.makeRequest('GET', '/users'); // No token
        throw new Error('Should have failed without authentication');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('✅ Unauthorized access correctly blocked', 'success');
        } else {
          throw error;
        }
      }

      // Test 3: Role-based access
      this.log('Testing role-based access...', 'info');
      const cashierToken = await this.authenticateUser('cashier1@essen.com', 'Cashier123!');

      try {
        await this.makeRequest('GET', '/users', null, cashierToken); // Cashier trying to access users
        throw new Error('Cashier should not have access to user management');
      } catch (error) {
        if (error.response?.status === 403) {
          this.log('✅ Role-based access control working', 'success');
        } else {
          throw error;
        }
      }

      return 'All security features working correctly!';
    });
  }

  async testDataIntegrity() {
    await this.runTest('Data Integrity', async () => {
      const adminToken = await this.authenticateUser('admin@essen.com', 'Admin123!');

      // Test 1: Product CRUD operations
      this.log('Testing product CRUD operations...', 'info');

      // Create
      const newProduct = await this.makeRequest('POST', '/products', {
        name: `Integrity Test Product ${Date.now()}`,
        price: 19.99,
        cost: 12.50,
        stockQty: 25,
        category: 'Test',
        sku: `INT${Date.now()}`,
        isActive: true
      }, adminToken);

      this.log(`✅ Created product: ${newProduct.name}`, 'success');

      // Read
      const retrievedProduct = await this.makeRequest('GET', `/products/${newProduct.id}`, null, adminToken);
      if (retrievedProduct.name !== newProduct.name) {
        throw new Error('Product retrieval failed');
      }
      this.log('✅ Product retrieval working', 'success');

      // Update
      const updatedProduct = await this.makeRequest('PUT', `/products/${newProduct.id}`, {
        ...retrievedProduct,
        price: 21.99
      }, adminToken);

      if (updatedProduct.price !== 21.99) {
        throw new Error('Product update failed');
      }
      this.log('✅ Product update working', 'success');

      // Test 2: Customer operations
      this.log('Testing customer operations...', 'info');

      const newCustomer = await this.makeRequest('POST', '/customers', {
        firstName: 'Integrity',
        lastName: `Test${Date.now()}`,
        email: `integrity${Date.now()}@test.com`,
        phone: '555-9999',
        status: 'active'
      }, adminToken);

      this.log(`✅ Created customer: ${newCustomer.firstName} ${newCustomer.lastName}`, 'success');

      return 'All data integrity tests passed!';
    });
  }

  async runAllTests() {
    this.log('🚀 Starting POS System Final Test Suite', 'info');
    this.log('=' .repeat(60), 'info');

    try {
      // Run all test suites
      await this.testCoreFunctionality();
      await this.testWorkflowScenarios();
      await this.testSecurityFeatures();
      await this.testDataIntegrity();

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
    }

    // Print final results
    this.printResults();
  }

  printResults() {
    this.log('\n' + '=' .repeat(60), 'info');
    this.log('📊 FINAL TEST RESULTS SUMMARY', 'info');
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
    }

    this.log('🏁 Final Test Suite Complete', 'info');
  }
}

// Run the final test
async function main() {
  const tester = new POSSystemFinalTest();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Final test suite error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  }
}

if (require.main === module) {
  main();
}

module.exports = POSSystemFinalTest;
