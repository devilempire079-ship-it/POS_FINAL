import React, { useState, useMemo } from 'react';
import { Star, Clock, TrendingUp, Users, Zap } from 'lucide-react';

const QSRShortcutsPanel = ({ onAddItem, orderItems = [], recentOrders = [] }) => {
  // Popular items based on common QSR menu items
  const popularItems = useMemo(() => [
    { id: 1, name: 'Big Mac', price: 5.99, category: 'burgers', icon: '🍔', prepTime: 3 },
    { id: 2, name: 'French Fries', price: 2.99, category: 'sides', icon: '🍟', prepTime: 2 },
    { id: 3, name: 'Coca Cola', price: 1.99, category: 'beverages', icon: '🥤', prepTime: 1 },
    { id: 4, name: 'Chicken Nuggets', price: 4.99, category: 'chicken', icon: '🍗', prepTime: 4 },
    { id: 5, name: 'Ice Cream Cone', price: 1.49, category: 'desserts', icon: '🍦', prepTime: 1 },
    { id: 6, name: 'Coffee', price: 1.79, category: 'beverages', icon: '☕', prepTime: 1 }
  ], []);

  // Quick combo meals
  const quickCombos = useMemo(() => [
    {
      id: 'combo1',
      name: 'Burger Combo',
      items: [
        { id: 1, name: 'Big Mac', quantity: 1 },
        { id: 2, name: 'French Fries', quantity: 1 },
        { id: 3, name: 'Coca Cola', quantity: 1 }
      ],
      totalPrice: 9.99,
      icon: '🍔',
      description: 'Burger + Fries + Drink'
    },
    {
      id: 'combo2',
      name: 'Chicken Combo',
      items: [
        { id: 4, name: 'Chicken Nuggets', quantity: 1 },
        { id: 2, name: 'French Fries', quantity: 1 },
        { id: 3, name: 'Coca Cola', quantity: 1 }
      ],
      totalPrice: 8.99,
      icon: '🍗',
      description: 'Nuggets + Fries + Drink'
    },
    {
      id: 'combo3',
      name: 'Family Meal',
      items: [
        { id: 1, name: 'Big Mac', quantity: 2 },
        { id: 2, name: 'French Fries', quantity: 2 },
        { id: 3, name: 'Coca Cola', quantity: 2 }
      ],
      totalPrice: 18.99,
      icon: '👨‍👩‍👧‍👦',
      description: '2 Burgers + 2 Fries + 2 Drinks'
    }
  ], []);

  // Handle adding popular item
  const handleAddPopularItem = (item) => {
    onAddItem(item);
  };

  // Handle adding combo
  const handleAddCombo = (combo) => {
    // Add each item in the combo
    combo.items.forEach(comboItem => {
      const menuItem = popularItems.find(item => item.id === comboItem.id);
      if (menuItem) {
        for (let i = 0; i < comboItem.quantity; i++) {
          onAddItem(menuItem);
        }
      }
    });
  };

  // Handle repeating recent order
  const handleRepeatOrder = (order) => {
    // This would need to be implemented based on how recent orders are stored
    console.log('Repeat order:', order);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-blue-200 p-4 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Quick Order
          </h3>
          <p className="text-sm text-gray-600">Fast shortcuts for common items</p>
        </div>

        {/* Popular Items */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            Popular Items
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {popularItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleAddPopularItem(item)}
                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-sm group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {item.prepTime}min
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-800">
                  {item.name}
                </div>
                <div className="text-sm font-bold text-green-600">
                  ${item.price.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Combos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            Quick Combos
          </h4>
          <div className="space-y-2">
            {quickCombos.map(combo => (
              <button
                key={combo.id}
                onClick={() => handleAddCombo(combo)}
                className="w-full bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-sm group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{combo.icon}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                    SAVE ${(combo.items.reduce((sum, item) => {
                      const menuItem = popularItems.find(mi => mi.id === item.id);
                      return sum + (menuItem?.price || 0) * item.quantity;
                    }, 0) - combo.totalPrice).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-green-800">
                  {combo.name}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {combo.description}
                </div>
                <div className="text-sm font-bold text-green-600">
                  ${combo.totalPrice.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-purple-500" />
              Recent Orders
            </h4>
            <div className="space-y-2">
              {recentOrders.slice(0, 3).map((order, index) => (
                <button
                  key={index}
                  onClick={() => handleRepeatOrder(order)}
                  className="w-full bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-purple-800">
                      Order #{order.id || index + 1}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      {order.timeAgo || 'Recent'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {order.items?.length || 0} items • {order.orderType || 'Counter'}
                  </div>
                  <div className="text-sm font-bold text-purple-600">
                    ${order.total?.toFixed(2) || '0.00'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Stats */}
        {orderItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1 text-blue-500" />
              Current Order
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">{orderItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-green-600">
                  ${orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orderItems.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-sm font-medium text-gray-800 mb-1">
              Ready for Orders
            </div>
            <div className="text-xs text-gray-600">
              Use shortcuts above for fast ordering
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QSRShortcutsPanel;
