const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3000/api';

async function testPermissionSystem() {
  console.log('🔐 Testing Permission System...\n');

  const testResults = {
    admin: { passed: 0, failed: 0, total: 0 },
    manager: { passed: 0, failed: 0, total: 0 },
    cashier: { passed: 0, failed: 0, total: 0 }
  };

  function logResult(user, test, success, message = '') {
    testResults[user].total++;
    if (success) {
      testResults[user].passed++;
      console.log(`✅ ${user.toUpperCase()}: ${test}`);
    } else {
      testResults[user].failed++;
      console.log(`❌ ${user.toUpperCase()}: ${test} - ${message}`);
    }
  }

  try {
    // Test Admin Permissions
    console.log('👑 Testing Admin Permissions...');
    const adminToken = await authenticateUser('admin@test.com', 'Admin123!');

    // Admin should have access to everything
    await testEndpoint(adminToken, 'GET', '/permissions/templates', 'Admin can view permission templates', true, 'admin');
    await testEndpoint(adminToken, 'GET', '/api/users', 'Admin can view all users', true, 'admin');
    await testEndpoint(adminToken, 'GET', '/api/customers', 'Admin can view customers', true, 'admin');
    await testEndpoint(adminToken, 'GET', '/api/products', 'Admin can view products', true, 'admin');

    // Test Manager Permissions
    console.log('\n👨‍💼 Testing Manager Permissions...');
    const managerToken = await authenticateUser('manager@test.com', 'Manager123!');

    // Manager should have access to most things but not user management
    await testEndpoint(managerToken, 'GET', '/api/customers', 'Manager can view customers', true, 'manager');
    await testEndpoint(managerToken, 'GET', '/api/products', 'Manager can view products', true, 'manager');
    await testEndpoint(managerToken, 'GET', '/api/users', 'Manager cannot view users', false, 'manager');

    // Test Cashier Permissions
    console.log('\n💰 Testing Cashier Permissions...');
    const cashierToken = await authenticateUser('cashier@test.com', 'Cashier123!');

    // Cashier should have limited access
    await testEndpoint(cashierToken, 'GET', '/api/products', 'Cashier can view products', true, 'cashier');
    await testEndpoint(cashierToken, 'GET', '/api/users', 'Cashier cannot view users', false, 'cashier');
    await testEndpoint(cashierToken, 'GET', '/api/customers', 'Cashier can view customers', true, 'cashier');

    // Test specific permission scenarios
    console.log('\n🎯 Testing Specific Permission Scenarios...');

    // Test user-specific permissions
    const userPermissions = await makeRequest('GET', `/api/users/1/permissions`, null, adminToken);
    logResult('admin', 'Can view own permissions', userPermissions && userPermissions.length > 0, 'admin');

    // Test template assignment
    const templates = await makeRequest('GET', '/permissions/templates', null, adminToken);
    if (templates && templates.length > 0) {
      const assignment = await makeRequest('POST', '/api/users/2/assign-template', { templateId: templates[0].id }, adminToken);
      logResult('admin', 'Can assign permission templates', assignment && !assignment.error, 'admin');
    }

    // Test permission creation
    const newTemplate = await makeRequest('POST', '/permissions/templates', {
      name: `Test Template ${Date.now()}`,
      description: 'Test permission template',
      permissions: [
        { resource: 'dashboard', action: 'view', allowed: true },
        { resource: 'products', action: 'view', allowed: true }
      ]
    }, adminToken);
    logResult('admin', 'Can create permission templates', newTemplate && newTemplate.id, 'admin');

  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERMISSION TEST RESULTS');
  console.log('='.repeat(60));

  Object.entries(testResults).forEach(([user, results]) => {
    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    console.log(`${user.toUpperCase()}: ${results.passed}/${results.total} passed (${successRate}%)`);
  });

  const totalTests = Object.values(testResults).reduce((sum, r) => sum + r.total, 0);
  const totalPassed = Object.values(testResults).reduce((sum, r) => sum + r.passed, 0);
  const overallSuccess = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`\nOVERALL: ${totalPassed}/${totalTests} tests passed (${overallSuccess}%)`);

  if (totalPassed === totalTests) {
    console.log('🎉 ALL PERMISSION TESTS PASSED!');
  } else {
    console.log('⚠️ Some permission tests failed. Check the results above.');
  }

  console.log('='.repeat(60));

  async function authenticateUser(email, password) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      return response.data.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed for ${email}: ${error.response?.data?.error || error.message}`);
    }
  }

  async function makeRequest(method, endpoint, data = null, token = null) {
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
      return { error: error.response?.data?.error || error.message };
    }
  }

  async function testEndpoint(token, method, endpoint, description, shouldSucceed, userType) {
    const result = await makeRequest(method, endpoint, null, token);
    const success = shouldSucceed ? !result.error : result.error;
    logResult(userType, description, success, result.error || 'Unexpected success');
  }

  await prisma.$disconnect();
}

testPermissionSystem();
