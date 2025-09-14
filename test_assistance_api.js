// Test script to verify assistance request API endpoints with authentication
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3004/api';
let authToken = null;

async function login() {
  try {
    console.log('🔐 Logging in first...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@essen.com',
        password: 'Admin123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      const error = await loginResponse.text();
      console.log('Login error:', error);
      return false;
    }

    const loginData = await loginResponse.json();
    authToken = loginData.accessToken;

    console.log('✅ Login successful! Token:', authToken.substring(0, 30) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testAssistanceAPI() {
  console.log('🔍 Testing Assistance Request API with authentication...\n');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    'X-Terminal-ID': 'test-terminal-' + Date.now()
  };

  try {
    // Test 1: Get assistance requests (empty list expected)
    console.log('📋 Test 1: GET /api/assistance-requests');
    const getResponse = await fetch(`${BASE_URL}/assistance-requests`, {
      headers: authHeaders
    });

    if (!getResponse.ok) {
      console.log('❌ Status:', getResponse.status);
      const errorText = await getResponse.text();
      console.log('❌ Error:', errorText);
    } else {
      const data = await getResponse.json();
      console.log('✅ Success - Found', data.assistanceRequests?.length || 0, 'requests');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

    console.log('\n---\n');

    // Test 2: Create assistance request
    console.log('📝 Test 2: POST /api/assistance-requests');
    const postResponse = await fetch(`${BASE_URL}/assistance-requests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        tableId: 1,
        tableNumber: 'T1',
        serverId: 1,
        serverName: 'Test Server',
        assistanceType: 'cleanup',
        priority: 'normal',
        description: 'Testing API - spilled drink needs attention'
      })
    });

    if (!postResponse.ok) {
      console.log('❌ Status:', postResponse.status);
      const errorText = await postResponse.text();
      console.log('❌ Error:', errorText);
    } else {
      const data = await postResponse.json();
      console.log('✅ Successfully created assistance request!');
      console.log('Created:', {
        id: data.assistanceRequest?.id,
        table: data.assistanceRequest?.tableNumber,
        type: data.assistanceRequest?.assistanceType,
        status: data.assistanceRequest?.status
      });
    }

    console.log('\n---\n');

    // Test 3: Get assistance requests again (should have 1 now)
    console.log('📋 Test 3: GET /api/assistance-requests (should show our new request)');
    const getResponse2 = await fetch(`${BASE_URL}/assistance-requests`, {
      headers: authHeaders
    });

    if (!getResponse2.ok) {
      console.log('❌ Status:', getResponse2.status);
      const errorText = await getResponse2.text();
      console.log('❌ Error:', errorText);
    } else {
      const data = await getResponse2.json();
      console.log('✅ Now found', data.assistanceRequests?.length || 0, 'requests');
      if (data.assistanceRequests?.length > 0) {
        const latest = data.assistanceRequests[0];
        console.log('Latest request:', {
          id: latest.id,
          table: latest.tableNumber,
          type: latest.assistanceType,
          status: latest.status,
          createdAt: latest.createdAt
        });
      }
    }

    console.log('\n---\n');

    // Test 4: Get notifications
    console.log('🔔 Test 4: GET /api/notifications');
    const getNotificationsResponse = await fetch(`${BASE_URL}/notifications`, {
      headers: authHeaders
    });

    if (!getNotificationsResponse.ok) {
      console.log('❌ Status:', getNotificationsResponse.status);
      const errorText = await getNotificationsResponse.text();
      console.log('❌ Error:', errorText);
    } else {
      const data = await getNotificationsResponse.json();
      console.log('✅ Found', data.notifications?.length || 0, 'notifications');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Timeout to give user time to start server
setTimeout(testAssistanceAPI, 2000);
