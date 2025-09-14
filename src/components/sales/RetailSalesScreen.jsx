import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  ShoppingCart,
  X,
  Check,
  Package,
  Calculator
} from 'lucide-react';

// Mock retail products
const retailProducts = [
  { id: 1, name: 'Wireless Headphones', price: 89.99, category: 'Electronics', stock: 25, barcode: '123456789001' },
  { id: 2, name: 'Bluetooth Speaker', price: 49.99, category: 'Electronics', stock: 18, barcode: '123456789002' },
  { id: 3, name: 'Smart Watch', price: 199.99, category: 'Electronics', stock: 12, barcode: '123456789003' },
  { id: 4, name: 'Laptop Stand', price: 34.99, category: 'Accessories', stock: 30, barcode: '123456789004' },
  { id: 5, name: 'USB Cable', price: 12.99, category: 'Accessories', stock: 45, barcode: '123456789005' },
  { id: 6, name: 'Phone Case', price: 24.99, category: 'Accessories', stock: 22, barcode: '123456789006' },
  { id: 7, name: 'T-Shirt', price: 19.99, category: 'Clothing', stock: 35, barcode: '123456789007' },
  { id: 8, name: 'Jeans', price: 59.99, category: 'Clothing', stock: 15, barcode: '123456789008' },
  { id: 9, name: 'Sneakers', price: 89.99, category: 'Footwear', stock: 20, barcode: '123456789009' },
  { id: 10, name: 'Backpack', price: 39.99, category: 'Bags', stock: 28, barcode: '123456789010' },
  { id: 11, name: 'Sunglasses', price: 29.99, category: 'Accessories', stock: 16, barcode: '123456789011' },
  { id: 12, name: 'Water Bottle', price: 14.99, category: 'Sports', stock: 40, barcode: '123456789012' }
];

const RetailSalesScreen = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPayment, setShowPayment] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [transactionComplete, setTransactionComplete] = useState(false);

  const categories = ['All', ...new Set(retailProducts.map(p => p.category))];

  const filteredProducts = retailProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTax = () => getSubtotal() * 0.08; // 8% tax
  const getTotal = () => getSubtotal() + getTax();

  const processPayment = () => {
    if (paymentMethod === 'cash' && parseFloat(cashReceived) < getTotal()) {
      alert('Insufficient cash received');
      return;
    }
    setTransactionComplete(true);
    setTimeout(() => {
      setCart([]);
      setCustomer(null);
      setShowPayment(false);
      setCashReceived('');
      setTransactionComplete(false);
      setPaymentMethod('cash');
    }, 3000);
  };

  const getChange = () => {
    if (paymentMethod !== 'cash' || !cashReceived) return 0;
    return parseFloat(cashReceived) - getTotal();
  };

  if (transactionComplete) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Transaction Complete!</h1>
          <p className="text-green-600 mb-4">Retail sale processed successfully</p>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{paymentMethod === 'cash' ? 'Cash' : 'Card'}</span>
              </div>
              {paymentMethod === 'cash' && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-bold">${getChange().toFixed(2)}</span>
                </div>
              )}
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
              <Package className="w-6 h-6 mr-2 text-blue-600" />
              Retail POS
            </h1>
            <p className="text-gray-600">Transaction #{Date.now().toString().slice(-6)}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setCustomer({ name: 'John Doe', phone: '555-0123' })}
              className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100"
            >
              <span>{customer ? customer.name : 'Add Customer'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Products */}
        <div className="w-2/3 p-6 bg-white">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-280px)] overflow-y-auto">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <Package className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{product.barcode}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-1/3 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Cart Items */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items in cart</p>
                <p className="text-sm text-gray-400 mt-1">Click products to add them</p>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-white">
              {!showPayment ? (
                <>
                  {/* Order Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>${getTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Checkout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Payment Options */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cash
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <CreditCard className="w-4 h-4 mr-2" />
                        Card
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cash Received
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {cashReceived && parseFloat(cashReceived) >= getTotal() && (
                        <p className="text-sm text-green-600 mt-2">
                          Change: ${getChange().toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={processPayment}
                      disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < getTotal())}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Complete Sale</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetailSalesScreen;
