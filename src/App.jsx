import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BusinessTypeProvider, useBusinessType } from './hooks/useBusinessType';
import { TableProvider } from './hooks/TableContext';
import { KitchenOrdersProvider } from './hooks/KitchenOrdersContext';
import { OrderManagementProvider } from './hooks/OrderManagementContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SalesScreen from './components/SalesScreen';
import InventoryScreen from './components/InventoryScreen';
import CrmScreen from './components/CrmScreen';
import ReportsScreen from './components/ReportsScreen';
import SettingsScreen from './components/SettingsScreen';

// Import specialized sales screens
import RestaurantSalesScreen from './components/sales/restaurant/RestaurantSalesScreen';
import RepairSalesScreen from './components/sales/repair/RepairSalesScreen';
import PharmacySalesScreen from './components/sales/pharmacy/PharmacySalesScreen';
import RentalSalesScreen from './components/sales/rental/RentalSalesScreen';

// Import restaurant components
import TableManagement from './components/restaurant/TableManagement';
import KitchenDisplay from './components/restaurant/KitchenDisplay';
import OrderPickupStation from './components/restaurant/OrderPickupStation';
import ReservationManagement from './components/restaurant/ReservationManagement';
import StaffManagement from './components/restaurant/StaffManagement';
import TerminalManagement from './components/TerminalManagement';

function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      alert(result.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          POS System Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              setEmail('admin@essen.com');
              setPassword('Admin123!');
            }}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Use Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

function BusinessTypeSalesRouter() {
  const { businessType, loading: businessTypeLoading } = useBusinessType();

  if (businessTypeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business type...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate sales screen based on business type
  switch (businessType?.code) {
    case 'restaurant':
      return <RestaurantSalesScreen />;
    case 'repair':
      return <RepairSalesScreen />;
    case 'pharmacy':
      console.log('Loading Pharmacy Sales Screen for business type:', businessType.name);
      return <PharmacySalesScreen />;
    case 'rental':
      return <RentalSalesScreen />;
    case 'retail':
    default:
      console.log('Loading Default Sales Screen for business type:', businessType?.code || 'none');
      return <SalesScreen />;
  }
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Layout */}
      <div className="flex flex-col min-h-screen">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<BusinessTypeSalesRouter />} />
              <Route path="/inventory" element={<InventoryScreen />} />
              <Route path="/crm" element={<CrmScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              {/* Restaurant-specific routes */}
              <Route path="/restaurant/tables" element={<TableManagement />} />
              <Route path="/restaurant/kitchen" element={<KitchenDisplay />} />
              <Route path="/restaurant/pickup" element={<OrderPickupStation />} />
              <Route path="/restaurant/reservations" element={<ReservationManagement />} />
              <Route path="/restaurant/staff" element={<StaffManagement />} />
              <Route path="/restaurant/terminals" element={<TerminalManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BusinessTypeProvider>
        <TableProvider>
          <KitchenOrdersProvider>
            <OrderManagementProvider>
              <Router>
                <AuthenticatedApp />
                <Toaster position="top-right" />
              </Router>
            </OrderManagementProvider>
          </KitchenOrdersProvider>
        </TableProvider>
      </BusinessTypeProvider>
    </AuthProvider>
  );
}

export default App;
