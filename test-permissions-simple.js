const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3003/api';

// Test login and get token
async function loginAndGetToken(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Login successful for ${email}`);
      return data.accessToken;
    } else {
      console.log(`❌ Login failed for ${email}:`, data.error);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Test permission templates endpoint
async function testPermissionTemplates(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/permissions/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Permission templates fetched successfully');
      console.log(`   Found ${data.length} templates:`, data.map(t => t.name));
      return data;
    } else {
      console.log('❌ Failed to fetch permission templates:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Permission templates error:', error);
    return null;
  }
}

// Test users endpoint
async function testUsersEndpoint(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Users fetched successfully');
      console.log(`   Found ${data.length} users:`, data.map(u => `${u.name} (${u.role})`));
      return data;
    } else {
      console.log('❌ Failed to fetch users:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Users endpoint error:', error);
    return null;
  }
}

// Test user permissions endpoint
async function testUserPermissions(token, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ User permissions fetched for user ${userId}`);
      console.log(`   Found ${data.length} permissions`);
      return data;
    } else {
      console.log(`❌ Failed to fetch user permissions for ${userId}:`, data.error);
      return null;
    }
  } catch (error) {
    console.error('User permissions error:', error);
    return null;
  }
}

// Main test function
async function runPermissionTests() {
  console.log('🧪 Testing Permission Management Endpoints\n');

  // Test with admin user (using the correct credentials from direct-sql-seed.js)
  console.log('🔐 Testing with Admin user...');
  const adminToken = await loginAndGetToken('admin@essen.com', 'Admin123!');

  if (!adminToken) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }

  // Test permission templates
  const templates = await testPermissionTemplates(adminToken);

  // Test users endpoint
  const users = await testUsersEndpoint(adminToken);

  // Test user permissions if we have users
  if (users && users.length > 0) {
    const firstUserId = users[0].id;
    await testUserPermissions(adminToken, firstUserId);
  }

  console.log('\n🎯 Permission Management Test Complete');
}

// Run the tests
runPermissionTests().catch(console.error);
