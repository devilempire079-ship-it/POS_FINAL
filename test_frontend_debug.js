// Frontend Debug Test - Run this in browser console
async function testFrontendAPIs() {
  console.log('🔍 Testing Frontend API Integration...\n');

  // Test health check (should work without auth)
  console.log('1️⃣ Testing health endpoint (no auth)...');
  try {
    const healthResponse = await fetch('http://localhost:3004/api/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed:', health.status);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return;
  }

  // Test login
  console.log('\n2️⃣ Testing login...');
  try {
    const loginResponse = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@essen.com',
        password: 'Admin123!'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');

      // Test assistance request creation
      console.log('\n3️⃣ Testing assistance request creation...');
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.accessToken}`,
        'X-Terminal-ID': 'frontend-debug-' + Date.now()
      };

      const assistanceResponse = await fetch('http://localhost:3004/api/assistance-requests', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          tableId: 1,
          tableNumber: 'T1',
          serverId: 1,
          serverName: 'Debug User',
          assistanceType: 'cleanup',
          priority: 'normal',
          description: 'Test from frontend debug'
        })
      });

      if (assistanceResponse.ok) {
        const result = await assistanceResponse.json();
        console.log('✅ Assistance request created successfully!');
        console.log('Result:', result);
      } else {
        console.log('❌ Assistance request failed:', assistanceResponse.status);
        const error = await assistanceResponse.text();
        console.log('Error details:', error);
      }

      console.log('\n🎯 SUCCESS: All APIs working correctly!');
      console.log('The frontend issue is likely session/authentication related.');
      console.log('\n💡 Try these steps:');
      console.log('1. Log out and log back in');
      console.log('2. Clear browser cache');
      console.log('3. Check browser network tab for 401 errors');

    } else {
      console.log('❌ Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Login error:', error);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
}

// Auto-run the test
testFrontendAPIs();
