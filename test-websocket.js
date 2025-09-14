const WebSocket = require('ws');

console.log('Testing WebSocket connection to real-time analytics...');

// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Listening for real-time updates...\n');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📡 Real-time Update Received:');
    console.log(JSON.stringify(message, null, 2));
    console.log('---\n');
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});

// Keep the script running for 30 seconds to test
setTimeout(() => {
  console.log('Test completed. Closing connection...');
  ws.close();
}, 30000);