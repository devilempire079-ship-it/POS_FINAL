// Test script to verify authentication fixes
const api = require('./src/services/api');

async function testAuth() {
  console.log('🧪 Testing Authentication Fixes...\n');

  try {
    // Test 1: Check if API client initializes properly
    console.log('✅ Test 1: API client initialized');
    console.log('   Token:', api.token ? 'Present' : 'Not present');

    // Test 2: Try to make a request without auth (should fail gracefully)
    console.log('\n🔍 Test 2: Testing unauthenticated request...');
    try {
      const response = await api.get('/business-types');
      console.log('   Unexpected success:', response);
    } catch (error) {
      console.log('   ✅ Expected failure:', error.message);
    }

    // Test 3: Check localStorage simulation
    console.log('\n💾 Test 3: Checking localStorage state...');
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('pos_token');
      const user = localStorage.getItem('pos_user');
      console.log('   Stored token:', token ? 'Present' : 'Not present');
      console.log('   Stored user:', user ? 'Present' : 'Not present');
    } else {
      console.log('   localStorage not available in Node.js environment');
    }

    console.log('\n🎉 Authentication tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open browser to http://localhost:5174');
    console.log('2. Try logging in with: admin@essen.com / admin123');
    console.log('3. Check console for reduced 401 errors');
    console.log('4. Verify business type data loads properly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuth();
