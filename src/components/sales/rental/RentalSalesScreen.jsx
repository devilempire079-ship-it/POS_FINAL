import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  Wrench,
  Shield
} from 'lucide-react';

const RentalSalesScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('equipment');
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [currentRental, setCurrentRental] = useState(null);

  // Mock equipment inventory
  const equipmentInventory = [
    { id: 1, name: 'Concrete Mixer', price: 45.99, category: 'Construction', stock: 8, deposit: 200 },
    { id: 2, name: 'Jackhammer', price: 35.99, category: 'Construction', stock: 12, deposit: 150 },
    { id: 3, name: 'Pressure Washer', price: 29.99, category: 'Cleaning', stock: 15, deposit: 100 },
    { id: 4, name: 'Ladder 24ft', price: 15.99, category: 'Access', stock: 20, deposit: 50 },
    { id: 5, name: 'Generator 5000W', price: 55.99, category: 'Power', stock: 6, deposit: 300 },
    { id: 6, name: 'Air Compressor', price: 25.99, category: 'Power', stock: 10, deposit: 120 },
    { id: 7, name: 'Tile Saw', price: 39.99, category: 'Construction', stock: 5, deposit: 180 },
    { id: 8, name: 'Paint Sprayer', price: 22.99, category: 'Painting', stock: 14, deposit: 80 },
  ];

  // Mock customer rentals
  const mockRentals = [
    {
      id: 1,
      customerName: 'Bob Construction',
      equipment: 'Concrete Mixer',
      rentalDate: '2025-09-01',
      returnDate: '2025-09-05',
      status: 'active',
      dailyRate: 45.99,
      deposit: 200
    },
    {
      id: 2,
      customerName: 'Alice Home Repair',
      equipment: 'Pressure Washer',
      rentalDate: '2025-08-28',
      returnDate: '2025-08-30',
      status: 'returned',
      dailyRate: 29.99,
      deposit: 100
    },
    {
      id: 3,
      customerName: 'Charlie Landscaping',
      equipment: 'Generator 5000W',
      rentalDate: '2025-09-02',
      returnDate: '2025-09-07',
      status: 'overdue',
      dailyRate: 55.99,
      deposit: 300
    }
  ];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    driversLicense: '',
    insuranceProvider: ''
  });

  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: '',
    duration: 1
  });

  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, {
        ...item,
        quantity: 1,
        rentalDates: rentalDates,
        totalDays: rentalDates.duration,
        subtotal: item.price * rentalDates.duration,
        deposit: item.deposit
      }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? {
          ...item,
          quantity: newQuantity,
          subtotal: item.price * rentalDates.duration * newQuantity
        } : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateDeposits = () => {
    return cartItems.reduce((sum, item) => sum + (item.deposit * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculateLateFees = () => {
    // Mock late fee calculation
    return mockRentals
      .filter(rental => rental.status === 'overdue')
      .reduce((sum, rental) => {
        const overdueDays = Math.max(0, Math.floor((new Date() - new Date(rental.returnDate)) / (1000 * 60 * 60 * 24)));
        return sum + (overdueDays * rental.dailyRate * 0.5); // 50% of daily rate as late fee
      }, 0);
  };

  const processPayment = () => {
    setShowPayment(true);
  };

  const completeRental = () => {
    setCartItems([]);
    setShowPayment(false);
    setCurrentRental(null);
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      address: '',
      driversLicense: '',
      insuranceProvider: ''
    });
    alert('Rental agreement completed successfully!');
  };

  const createRentalAgreement = () => {
    if (!customerInfo.name || cartItems.length === 0) return;

    const newRental = {
      id: Date.now(),
      customer: customerInfo,
      equipment: cartItems,
      rentalDates: rentalDates,
      totalAmount: calculateTotal(),
      deposits: calculateDeposits(),
      createdAt: new Date().toLocaleString(),
      status: 'active'
    };

    setCurrentRental(newRental);
  };

  // Update rental duration when dates change
  useEffect(() => {
    if (rentalDates.startDate && rentalDates.endDate) {
      const start = new Date(rentalDates.startDate);
      const end = new Date(rentalDates.endDate);
      const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      setRentalDates(prev => ({ ...prev, duration }));

      // Update cart items with new duration
      setCartItems(cartItems.map(item => ({
        ...item,
        totalDays: duration,
        subtotal: item.price * duration * item.quantity
      })));
    }
  }, [rentalDates.startDate, rentalDates.endDate]);

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment - Equipment Rental
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Rental Summary</h3>
                {currentRental && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Customer Details</h4>
                    <p className="text-sm text-blue-600">Name: {currentRental.customer.name}</p>
                    <p className="text-sm text-blue-600">Phone: {currentRental.customer.phone}</p>
                    <p className="text-sm text-blue-600">Rental Period: {rentalDates.startDate} to {rentalDates.endDate}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${item.subtotal.toFixed(2)} ({item.totalDays} days)</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Deposit: ${item.deposit * item.quantity}</p>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Rental Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Security Deposits:</span>
                      <span>${calculateDeposits().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Due Today:</span>
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
                    🏦 Bank Transfer
                  </button>
                </div>

                <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Security deposits will be refunded upon equipment return in good condition.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={completeRental}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Complete Rental
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
              <Truck className="w-6 h-6 mr-2 text-orange-600" />
              Equipment Rental POS
            </h1>
            <p className="text-gray-600">Rental Agent: {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>
            {currentRental && (
              <div className="bg-orange-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-orange-800">
                  Rental #{currentRental.id}
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
              { id: 'equipment', name: 'Equipment', icon: Wrench },
              { id: 'customer', name: 'Customer Info', icon: User },
              { id: 'rentals', name: 'Active Rentals', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
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
        {/* Left Panel - Equipment/Customer/Rentals */}
        <div className="w-2/3 p-6 bg-white">
          {activeTab === 'equipment' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Available Equipment</h2>

              {/* Rental Date Selection */}
              <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-3">Rental Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={rentalDates.startDate}
                      onChange={(e) => setRentalDates({...rentalDates, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={rentalDates.endDate}
                      onChange={(e) => setRentalDates({...rentalDates, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      {rentalDates.duration} day{rentalDates.duration !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentInventory.map(equipment => (
                  <button
                    key={equipment.id}
                    onClick={() => addToCart(equipment)}
                    disabled={!rentalDates.startDate || !rentalDates.endDate}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        equipment.stock > 10 ? 'bg-green-100 text-green-800' :
                        equipment.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Stock: {equipment.stock}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{equipment.category}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-orange-600">${equipment.price.toFixed(2)}/day</p>
                        <p className="text-xs text-gray-500">Deposit: ${equipment.deposit}</p>
                      </div>
                      {rentalDates.duration > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-medium">${(equipment.price * rentalDates.duration).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">for {rentalDates.duration} days</p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customer' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter customer address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver's License
                    </label>
                    <input
                      type="text"
                      value={customerInfo.driversLicense}
                      onChange={(e) => setCustomerInfo({...customerInfo, driversLicense: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="License number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      value={customerInfo.insuranceProvider}
                      onChange={(e) => setCustomerInfo({...customerInfo, insuranceProvider: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      placeholder="Insurance company"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-blue-800">Rental Agreement</h3>
                    <p className="text-sm text-blue-600">
                      By proceeding, customer agrees to rental terms and conditions.
                      Equipment must be returned in the same condition with all parts intact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rentals' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Active Rentals</h2>

              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Late Fees Due: <span className="font-bold text-red-600">${calculateLateFees().toFixed(2)}</span>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                  Collect Late Fees
                </button>
              </div>

              <div className="space-y-4">
                {mockRentals.map(rental => (
                  <div key={rental.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{rental.customerName}</h3>
                        <p className="text-sm text-gray-600">{rental.equipment}</p>
                        <p className="text-sm text-gray-600">
                          {rental.rentalDate} to {rental.returnDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rental.status === 'active' ? 'bg-green-100 text-green-800' :
                          rental.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rental.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">${rental.dailyRate}/day</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                        View Details
                      </button>
                      {rental.status === 'active' && (
                        <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                          Return Equipment
                        </button>
                      )}
                      {rental.status === 'overdue' && (
                        <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                          Send Reminder
                        </button>
                      )}
                    </div>
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
              Rental Cart ({cartItems.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No equipment selected</p>
                <p className="text-sm text-gray-400 mt-1">Add equipment to start rental</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">${item.price.toFixed(2)}/day × {item.totalDays} days</p>
                        <p className="text-xs text-orange-600">Deposit: ${item.deposit}</p>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Qty: {item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">
                        ${(item.subtotal * item.quantity).toFixed(2)}
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
                  <span>Rental Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-600 text-sm">
                  <span>Security Deposits:</span>
                  <span>${calculateDeposits().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Due Today:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={createRentalAgreement}
                  disabled={!customerInfo.name || !customerInfo.phone}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 text-sm"
                >
                  Create Rental Agreement
                </button>
                <button
                  onClick={processPayment}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalSalesScreen;
