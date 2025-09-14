const axios = require('axios');

const API_BASE = 'http://localhost:3003/api';

class SimpleAPITest {
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

  async makeRequest(method, endpoint, data = null, token = null) {
    const config = {
      timeout: 5000 // 5 second timeout
    };

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
      if (error.response) {
        // Server responded with error status
        throw new Error(`HTTP ${error.response.status}: ${error.response.data?.error || error.message}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused - server may not be running');
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  async testServerConnectivity() {
    await this.runTest('Server Connectivity', async () => {
      const products = await this.makeRequest('GET', '/products');
      this.log(`✅ Server responding, found ${products.length} products`, 'success');
      return `Server connected, ${products.length} products available`;
    });
  }

  async testAuthentication() {
    await this.runTest('Authentication System', async () => {
      // Test admin login
      const adminResponse = await this.makeRequest('POST', '/auth/login', {
        email: 'admin@essen.com',
        password: 'Admin123!'
      });

      if (!adminResponse.accessToken) {
        throw new Error('Admin login failed - no access token received');
      }

      this.log('✅ Admin authentication successful', 'success');

      // Test manager login
      const managerResponse = await this.makeRequest('POST', '/auth/login', {
        email: 'manager@essen.com',
        password: 'Manager123!'
      });

      if (!managerResponse.accessToken) {
        throw new Error('Manager login failed - no access token received');
      }

      this.log('✅ Manager authentication successful', 'success');

      // Test cashier login
      const cashierResponse = await this.makeRequest('POST', '/auth/login', {
        email: 'cashier1@essen.com',
        password: 'Cashier123!'
      });

      if (!cashierResponse.accessToken) {
        throw new Error('Cashier login failed - no access token received');
      }

      this.log('✅ Cashier authentication successful', 'success');

      return 'All user authentications successful';
    });
  }

  async testInvalidCredentials() {
    await this.runTest('Invalid Credentials Handling', async () => {
      try {
        await this.makeRequest('POST', '/auth/login', {
          email: 'admin@essen.com',
          password: 'wrongpassword'
        });
        throw new Error('Should have failed with invalid password');
      } catch (error) {
        if (error.message.includes('Invalid credentials') || error.message.includes('401')) {
          this.log('✅ Invalid password correctly rejected', 'success');
          return 'Invalid credentials properly handled';
        } else {
          throw error;
        }
      }
    });
  }

  async testRoleBasedAccess() {
    await this.runTest('Role-Based Access Control', async () => {
      const adminToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'admin@essen.com',
        password: 'Admin123!'
      })).accessToken;

      const managerToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'manager@essen.com',
        password: 'Manager123!'
      })).accessToken;

      const cashierToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'cashier1@essen.com',
        password: 'Cashier123!'
      })).accessToken;

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
      const adminToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'admin@essen.com',
        password: 'Admin123!'
      })).accessToken;

      // Get existing products
      const products = await this.makeRequest('GET', '/products', null, adminToken);
      this.log(`✅ Retrieved ${products.length} products`, 'success');

      if (products.length === 0) {
        this.log('⚠️ No products found - this may indicate seeding issues', 'warning');
      }

      return `Product management working with ${products.length} products`;
    });
  }

  async testCustomerManagement() {
    await this.runTest('Customer Management', async () => {
      const adminToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'admin@essen.com',
        password: 'Admin123!'
      })).accessToken;

      // Get customers
      const customers = await this.makeRequest('GET', '/customers', null, adminToken);
      this.log(`✅ Retrieved ${customers.customers?.length || 0} customers`, 'success');

      return `Customer management working with ${customers.customers?.length || 0} customers`;
    });
  }

  async testAnalytics() {
    await this.runTest('Analytics System', async () => {
      const adminToken = (await this.makeRequest('POST', '/auth/login', {
        email: 'admin@essen.com',
        password: 'Admin123!'
      })).accessToken;

      // Test real-time analytics
      const analytics = await this.makeRequest('GET', '/analytics/realtime', null, adminToken);
      this.log(`✅ Retrieved analytics: $${analytics.todaySales || 0} sales today`, 'success');

      return `Analytics system working - today: $${analytics.todaySales || 0}`;
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Simple API Test Suite', 'info');
    this.log('=' .repeat(50), 'info');

    try {
      // Run all test suites in logical order
      await this.testServerConnectivity();
      await this.testAuthentication();
      await this.testInvalidCredentials();
      await this.testRoleBasedAccess();
      await this.testProductManagement();
      await this.testCustomerManagement();
      await this.testAnalytics();

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
    }

    // Print final results
    this.printResults();
  }

  printResults() {
    this.log('\n' + '=' .repeat(50), 'info');
    this.log('📊 SIMPLE API TEST RESULTS SUMMARY', 'info');
    this.log('=' .repeat(50), 'info');

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

    this.log('\n' + '=' .repeat(50), 'info');

    if (this.testResults.failed === 0) {
      this.log('🎉 ALL TESTS PASSED! API is fully functional.', 'success');
      this.log('🏆 Your POS API is working correctly!', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please review the issues above.', 'warning');
      this.log('💡 Common issues:', 'info');
      this.log('   • Server not running (check if node server.js is active)', 'info');
      this.log('   • Database not seeded properly', 'info');
      this.log('   • Authentication middleware issues', 'info');
      this.log('   • Network connectivity problems', 'info');
    }

    this.log('🏁 Simple API Test Suite Complete', 'info');
  }
}

// Run the simple API test
async function main() {
  const tester = new SimpleAPITest();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Simple API test suite error:', error);
  }

  process.exit(tester.testResults.failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = SimpleAPITest;
