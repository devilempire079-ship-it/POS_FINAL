import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Receipt,
  Clock,
  User,
  Smartphone,
  Laptop,
  Monitor,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const RepairSalesScreen = () => {
  const { user } = useAuth();
  const [currentWorkOrder, setCurrentWorkOrder] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('intake');

  // Mock parts inventory
  const partsInventory = [
    { id: 1, name: 'iPhone Screen', price: 89.99, category: 'Screens', stock: 15 },
    { id: 2, name: 'iPhone Battery', price: 49.99, category: 'Batteries', stock: 25 },
    { id: 3, name: 'iPhone Charging Port', price: 34.99, category: 'Ports', stock: 20 },
    { id: 4, name: 'Samsung Screen', price: 79.99, category: 'Screens', stock: 12 },
    { id: 5, name: 'Laptop Keyboard', price: 59.99, category: 'Keyboards', stock: 8 },
    { id: 6, name: 'Laptop RAM 8GB', price: 39.99, category: 'Memory', stock: 18 },
    { id: 7, name: 'Hard Drive 1TB', price: 69.99, category: 'Storage', stock: 10 },
    { id: 8, name: 'SSD 500GB', price: 89.99, category: 'Storage', stock: 14 },
  ];

  // Mock services
  const services = [
    { id: 1, name: 'Screen Replacement', price: 49.99, category: 'Repair', duration: '30 min' },
    { id: 2, name: 'Battery Replacement', price: 29.99, category: 'Repair', duration: '15 min' },
    { id: 3, name: 'Data Recovery', price: 99.99, category: 'Service', duration: '2-3 hours' },
    { id: 4, name: 'Virus Removal', price: 79.99, category: 'Service', duration: '1 hour' },
    { id: 5, name: 'System Optimization', price: 59.99, category: 'Service', duration: '45 min' },
    { id: 6, name: 'Hardware Diagnostics', price: 39.99, category: 'Diagnostic', duration: '30 min' },
  ];

  const deviceTypes = [
    { id: 'smartphone', name: 'Smartphone', icon: Smartphone },
    { id: 'laptop', name: 'Laptop', icon: Laptop },
    { id: 'desktop', name: 'Desktop PC', icon: Monitor },
    { id: 'tablet', name: 'Tablet', icon: Smartphone },
    { id: 'other', name: 'Other Device', icon: HardDrive },
  ];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    deviceType: '',
    deviceModel: '',
    problem: '',
    urgency: 'normal'
  });

  const createWorkOrder = () => {
    const newWorkOrder = {
      id: Date.now(),
      customer: customerInfo,
      technician: user?.name || 'Tech',
      status: 'intake',
      createdAt: new Date().toLocaleString(),
      estimatedCompletion: null,
      parts: [],
      services: [],
      totalCost: 0
    };

    setCurrentWorkOrder(newWorkOrder);
    setWorkOrders([...workOrders, newWorkOrder]);
    setActiveTab('repair');
  };

  const addToCart = (item, type = 'part') => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id && cartItem.type === type);

    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id && cartItem.type === type
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, type }]);
    }
  };

  const updateQuantity = (itemId, newQuantity, type) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => !(item.id === itemId && item.type === type)));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId && item.type === type
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const processPayment = () => {
    setShowPayment(true);
  };

  const completeWorkOrder = () => {
    if (currentWorkOrder) {
      setWorkOrders(workOrders.map(order =>
        order.id === currentWorkOrder.id
          ? { ...order, status: 'completed', completedAt: new Date().toLocaleString() }
          : order
      ));
    }

    setCurrentWorkOrder(null);
    setCartItems([]);
    setShowPayment(false);
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      deviceType: '',
      deviceModel: '',
      problem: '',
      urgency: 'normal'
    });
    setActiveTab('intake');

    alert('Work order completed successfully!');
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment - Work Order #{currentWorkOrder?.id}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Work Order Summary</h3>
                <div className="space-y-2 mb-4">
                  <div><strong>Customer:</strong> {currentWorkOrder?.customer.name}</div>
                  <div><strong>Device:</strong> {currentWorkOrder?.customer.deviceModel}</div>
                  <div><strong>Problem:</strong> {currentWorkOrder?.customer.problem}</div>
                </div>

                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex justify-between">
                      <span>{item.quantity}x {item.name} ({item.type})</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                    💳 Credit Card
                  </button>
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                    💵 Cash
                  </button>
                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
                    📱 Digital Wallet
                  </button>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={completeWorkOrder}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Complete Work Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wrench className="w-6 h-6 mr-2 text-blue-600" />
              Repair & Service POS
            </h1>
            <p className="text-gray-600">Technician: {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>
            {currentWorkOrder && (
              <div className="bg-blue-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  Work Order #{currentWorkOrder.id}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'intake', name: 'Customer Intake', icon: User },
              { id: 'repair', name: 'Parts & Services', icon: Wrench },
              { id: 'history', name: 'Work Orders', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Customer Intake / Parts & Services */}
        <div className="w-2/3 p-6 bg-white">
          {activeTab === 'intake' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Customer Intake</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Type
                    </label>
                    <select
                      value={customerInfo.deviceType}
                      onChange={(e) => setCustomerInfo({...customerInfo, deviceType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select device type</option>
                      {deviceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Model
                    </label>
                    <input
                      type="text"
                      value={customerInfo.deviceModel}
                      onChange={(e) => setCustomerInfo({...customerInfo, deviceModel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., iPhone 12, Dell XPS 13"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={customerInfo.urgency}
                      onChange={(e) => setCustomerInfo({...customerInfo, urgency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - Within a week</option>
                      <option value="normal">Normal - Within 2-3 days</option>
                      <option value="high">High - Same day</option>
                      <option value="urgent">Urgent - ASAP</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem Description
                </label>
                <textarea
                  value={customerInfo.problem}
                  onChange={(e) => setCustomerInfo({...customerInfo, problem: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the issue with the device..."
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={createWorkOrder}
                  disabled={!customerInfo.name || !customerInfo.deviceType || !customerInfo.problem}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Work Order
                </button>
              </div>
            </div>
          )}

          {activeTab === 'repair' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Parts & Services</h2>

              {/* Services Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => addToCart(service, 'service')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {service.duration}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">${service.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parts Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Parts Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partsInventory.map(part => (
                    <button
                      key={part.id}
                      onClick={() => addToCart(part, 'part')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{part.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          part.stock > 10 ? 'bg-green-100 text-green-800' :
                          part.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Stock: {part.stock}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-600">${part.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Work Order History</h2>
              <div className="space-y-4">
                {workOrders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Work Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.customer.deviceModel}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Cart */}
        <div className="w-1/3 bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cartItems.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items in cart</p>
                <p className="text-sm text-gray-400 mt-1">Add parts or services</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.type === 'part' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={processPayment}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairSalesScreen;
