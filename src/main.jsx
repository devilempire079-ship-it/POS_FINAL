import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Phase 1: Restoring CSS safely

console.log('🚀 Starting POS System...');
console.log('📦 React version:', React.version);
console.log('🌐 DOM ready:', document.readyState);

const rootElement = document.getElementById('root');
console.log('🎯 Root element found:', !!rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created');

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('🎉 App rendered successfully!');
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Error: Root element not found!</h1>';
}
