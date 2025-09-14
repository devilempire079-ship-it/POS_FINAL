import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { ProductSearchAndCart } from './ProductSearchAndCart';

const SalesScreen = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity, discount: 0 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = itemTotal * (item.discount / 100);
      return total + (itemTotal - discountAmount);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setLoading(true);
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          discount: item.discount || 0
        })),
        totalAmount: calculateTotal(),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(calculateSubtotal()),
        discount: 0,
        paymentType: 'cash',
        cashierId: user.id
      };

      const response = await api.createSale(saleData);
      alert('Sale completed successfully!');
      clearCart();
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-sm text-gray-600">Cashier: {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Items: {cart.length}</span>
            </div>
            <div className="bg-green-100 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-green-800">Total: ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column - Product Search */}
        <div className="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
          <ProductSearchAndCart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onAddProduct={addToCart}
            subtotal={calculateSubtotal()}
          />
        </div>

        {/* Middle Column - Shopping Cart */}
        <div className="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-green-600">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Cart</h2>
              <button
                onClick={clearCart}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                disabled={cart.length === 0}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
                </svg>
                <p className="text-sm font-medium">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-600">${item.price} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="font-medium text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-700"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Point of Sale */}
        <div className="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-purple-600">
            <h2 className="text-lg font-semibold text-white">Checkout</h2>
          </div>

          <div className="flex-1 p-4">
            {/* Payment Methods */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Cash', 'Card', 'Check'].map(method => (
                  <button
                    key={method}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="bg-gray-50 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span className="font-medium">{cart.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                disabled={cart.length === 0 || loading}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium">
                  Save
                </button>
                <button className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm font-medium">
                  Discount
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesScreen;
