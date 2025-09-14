import React, { useState, useEffect } from 'react';
import { Pill, Search, Scan, User, ShoppingCart, Plus, Minus, CreditCard, Truck, Wallet, Receipt as ReceiptIcon, AlertTriangle, CheckCircle, XCircle, Keyboard, Wifi, WifiOff, Settings } from 'lucide-react';

// ===== MAIN PHARMACY POS SCREEN =====
const PharmacySalesScreen = () => {

  // State management
  const [mode, setMode] = useState('pakistan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Handle barcode scan
  const handleScan = () => {
    alert('Barcode scanner activated - scanned: 0781-3244-01');
    // In real app, this would open camera or hardware scanner
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER BAR */}
      <HeaderSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onScan={handleScan}
        mode={mode}
        setMode={setMode}
      />

      {/* MAIN CONTENT - 2 PANEL LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL - PRODUCT CATALOG */}
        <div className="w-3/5 border-r border-gray-200 bg-gray-50">
          <ProductCatalogPanel
            searchTerm={searchTerm}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            onAddToCart={(product) => {
              const existingItem = cartItems.find(item => item.id === product.id);

              if (existingItem) {
                setCartItems(cartItems.map(item =>
                  item.id === product.id
                    ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                    : item
                ));
              } else {
                setCartItems([...cartItems, { ...product, quantity: product.quantity || 1 }]);
              }
            }}
          />
        </div>

        {/* RIGHT PANEL - PATIENT INFO + CART */}
        <div className="w-2/5 bg-white flex flex-col overflow-hidden">

          {/* PATIENT SELECTION & ALERTS - SHRINKABLE */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <PatientPanel
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
              mode={mode}
              verificationChecked={verificationChecked}
              setVerificationChecked={setVerificationChecked}
            />

            {/* ALERTS PANEL (International mode only) */}
            {mode === 'international' && (
              <AlertsPanel
                mode={mode}
                selectedPatient={selectedPatient}
                cartItems={cartItems}
              />
            )}
          </div>

          {/* CART SECTION - EXPANDABLE - TAKES REMAINING SPACE */}
          <div className="flex-1 border-t border-gray-200 overflow-hidden">
            <CartPanel
              cartItems={cartItems}
              onUpdateQuantity={(productId, newQuantity) => {
                setCartItems(cartItems.map(item =>
                  item.id === productId
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
                ));
              }}
              onDecreaseQuantity={(productId) => {
                setCartItems(cartItems.map(item =>
                  item.id === productId
                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                    : item
                ));
              }}
              onRemoveItem={(productId) => {
                setCartItems(cartItems.filter(item => item.id !== productId));
              }}
              onProcessPayment={(method) => {
                const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const tax = subtotal * 0.08;
                const total = subtotal + tax;
                alert(`Payment successful via ${method.toUpperCase()}!\nTotal: $${total.toFixed(2)}\nQuantity: ${cartItems.length} items`);
              }}
              mode={mode}
            />
          </div>

        </div>

      </div>

      {/* FOOTER TOOLBAR */}
      <FooterToolbar
        mode={mode}
        verificationChecked={verificationChecked}
        setVerificationChecked={setVerificationChecked}
      />

    </div>
  );
};

// ===== HEADER COMPONENT =====
const HeaderSection = ({
  searchTerm,
  setSearchTerm,
  onScan,
  mode,
  setMode
}) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
    <div className="flex items-center justify-between max-w-full">

      {/* Logo */}
      <div className="flex items-center space-x-4">
        <div className="text-3xl font-bold text-blue-600">🏥</div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pharmacy POS</h1>
          <p className="text-sm text-gray-500">Safe dispensing system</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            id="search-input"
            type="text"
            placeholder="🔍 Search meds, NDC, or barcode"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <button
            onClick={onScan}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
            title="Scan barcode"
          >
            <Scan className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">

        {/* Mode Toggle */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="pakistan">🇵🇰 Pakistan</option>
            <option value="international">🌍 International</option>
          </select>
        </div>

        {/* Pharmacist Info */}
        <div className="text-right">
          <div className="text-sm font-medium">Ahmed Khan</div>
          <div className="text-xs text-gray-500">Pharmacist</div>
        </div>

        {/* Date/Time */}
        <div className="text-right">
          <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</div>
        </div>

      </div>
    </div>
  </header>
);

// ===== PRODUCT CATALOG PANEL =====
const ProductCatalogPanel = ({
  searchTerm,
  selectedTab,
  setSelectedTab,
  onAddToCart
}) => {

  // Enhanced medicine data
  const allMedicines = [
    {
      id: 'M001',
      name: 'Amoxicillin',
      strength: '500mg',
      form: 'Capsules',
      packSize: '30 caps',
      price: 24.99,
      generic: true,
      ndc: '00054-3170-13',
      stock: 85,
      category: 'prescription',
      type: 'rx'
    },
    {
      id: 'M002',
      name: 'Lisinopril',
      strength: '10mg',
      form: 'Tablets',
      packSize: '30 tabs',
      price: 15.99,
      generic: true,
      ndc: '00781-0994-01',
      stock: 62,
      category: 'prescription',
      type: 'rx'
    },
    {
      id: 'M003',
      name: 'Ibuprofen',
      strength: '200mg',
      form: 'Tablets',
      packSize: '50 tabs',
      price: 12.99,
      generic: true,
      ndc: '66213-0125-00',
      stock: 150,
      category: 'otc',
      type: 'otc'
    },
    {
      id: 'M004',
      name: 'Vitamin D3',
      strength: '1000IU',
      form: 'Softgels',
      packSize: '90 softgels',
      price: 18.99,
      generic: false,
      ndc: '01767-0004-01',
      stock: 200,
      category: 'supplements',
      type: 'otc'
    },
    {
      id: 'M005',
      name: 'Blood Pressure Monitor',
      strength: '',
      form: 'Digital Device',
      packSize: '1 unit',
      price: 49.99,
      generic: false,
      ndc: 'E-BPM-001',
      stock: 15,
      category: 'medical-supplies',
      type: 'otc'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Products', count: allMedicines.length },
    { id: 'prescription', label: 'Prescription', count: allMedicines.filter(m => m.type === 'rx').length },
    { id: 'otc', label: 'OTC', count: allMedicines.filter(m => m.type === 'otc').length },
    { id: 'supplements', label: 'Supplements', count: allMedicines.filter(m => m.category === 'supplements').length },
    { id: 'medical-supplies', label: 'Medical Supplies', count: allMedicines.filter(m => m.category === 'medical-supplies').length },
  ];

  // Filter medicines
  const filteredMedicines = allMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.ndc.includes(searchTerm);
    const matchesTab = selectedTab === 'all' || medicine.type === selectedTab || medicine.category === selectedTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* Category Tabs */}
      <div className="border-b border-gray-200 px-6 bg-white">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Medicine Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredMedicines.map(medicine => (
            <MedicineCard key={medicine.id} medicine={medicine} onAddToCart={onAddToCart} />
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-6 py-3 bg-white">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredMedicines.length} products</span>
          <div className="flex space-x-2">
            <button disabled className="px-3 py-1 border rounded text-gray-400">Prev</button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
            <button disabled className="px-3 py-1 border rounded text-gray-400">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

// ===== MEDICINE CARD COMPONENT =====
const MedicineCard = ({ medicine, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const getStockColor = () => {
    if (medicine.stock >= 50) return 'bg-green-100 text-green-800';
    if (medicine.stock >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

      {/* Medicine Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">
            {medicine.name}
          </h3>
          <div className="text-sm text-gray-600">
            {medicine.strength && `${medicine.strength}, `}{medicine.form}
          </div>
          {medicine.generic && (
            <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded mt-1">
              Generic
            </span>
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${getStockColor()}`}>
          {medicine.stock} left
        </div>
      </div>

      {/* Price & Pack Info */}
      <div className="mb-3">
        <div className="text-lg font-bold text-blue-600">${medicine.price}</div>
        <div className="text-sm text-gray-500">{medicine.packSize}</div>
        <div className="text-xs text-gray-400">NDC: {medicine.ndc}</div>
      </div>

      {/* Quantity Input & Add Button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-2 py-1 text-gray-600 hover:bg-gray-50"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            min="1"
            max={medicine.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(medicine.stock, parseInt(e.target.value) || 1)))}
            className="w-12 text-center border-0 py-1"
            placeholder="Qty"
          />
          <button
            onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
            className="px-2 py-1 text-gray-600 hover:bg-gray-50"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={() => onAddToCart({...medicine, quantity: quantity})}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          disabled={medicine.stock === 0}
        >
          Add to Cart
        </button>
      </div>

    </div>
  );
};

// ===== PATIENT PANEL COMPONENT =====
const PatientPanel = ({ selectedPatient, setSelectedPatient, mode, verificationChecked, setVerificationChecked }) => {

  // Mock patient data
  const patients = [
    { id: 'P001', name: 'John Smith', age: 45, allergies: ['Penicillin'], history: ['Lisinopril', 'Ibuprofen', 'Vitamin D'] },
    { id: 'P002', name: 'Sarah Davis', age: 32, allergies: ['NSAID'], history: ['Amoxicillin', 'Ibuprofen'] },
    { id: 'P003', name: 'Mike Johnson', age: 58, allergies: ['Aspirin'], history: ['Lisinopril', 'Blood Pressure Monitor'] }
  ];

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="p-6 border-b border-gray-200">

      {/* Patient Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patient ID / Rx Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Patient ID or Rx number..."
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">
            Search
          </button>
        </div>
      </div>

      {/* Prescription Verification */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Prescription Verification</h4>

        {mode === 'pakistan' ? (
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={verificationChecked}
              onChange={(e) => setVerificationChecked(e.target.checked)}
              className="mt-1"
            />
            <div>
              <span className="text-sm font-medium">Prescription Seen (Physical)</span>
              <p className="text-xs text-gray-500 mt-1">Confirm physical prescription has been reviewed</p>
            </div>
          </label>
        ) : (
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium">
              Verify Prescription
            </button>
            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm">
              Upload Rx Document
            </button>
          </div>
        )}
      </div>

      {/* Patient History */}
      {selectedPatientData && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Patient History</h4>
          <div className="bg-gray-50 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{selectedPatientData.name}</span>
              <span className="text-sm text-gray-500">• Age {selectedPatientData.age}</span>
            </div>

            {selectedPatientData.allergies.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-red-600 font-medium mb-1">Allergies:</div>
                <div className="flex gap-1">
                  {selectedPatientData.allergies.map(allergy => (
                    <span key={allergy} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-gray-600 font-medium mb-2">Last 3 medications:</div>
              <div className="space-y-1">
                {selectedPatientData.history.slice(0, 3).map(med => (
                  <div key={med} className="text-sm text-gray-700">• {med}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ===== ALERTS PANEL COMPONENT =====
const AlertsPanel = ({ mode, selectedPatient, cartItems }) => {

  // Mock alerts based on patient and cart items
  const generateAlerts = () => {
    if (mode !== 'international') return [];

    const alerts = [];
    const mockPatientData = {
      'P001': { allergies: ['Penicillin'], meds: ['Lisinopril', 'Ibuprofen'] },
      'P002': { allergies: ['NSAID'], meds: ['Amoxicillin', 'Ibuprofen'] },
      'P003': { allergies: ['Aspirin'], meds: ['Lisinopril'] }
    };

    const patientData = mockPatientData[selectedPatient];
    if (!patientData) return [];

    cartItems.forEach(item => {
      if (item.name === 'Amoxicillin' && patientData.allergies.includes('Penicillin')) {
        alerts.push({
          type: 'allergy',
          severity: 'severe',
          message: 'Penicillin allergy - avoid Amoxicillin series antibiotics'
        });
      }

      if (item.name.includes('Ibuprofen') && patientData.allergies.includes('NSAID')) {
        alerts.push({
          type: 'allergy',
          severity: 'severe',
          message: 'NSAID allergy - consider acetaminophen instead'
        });
      }

      if (item.name.includes('Lisinopril') && patientData.meds.includes('Ibuprofen')) {
        alerts.push({
          type: 'interaction',
          severity: 'moderate',
          message: 'ACE inhibitor + NSAID may increase blood pressure risk'
        });
      }
    });

    return alerts;
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe': return 'border-red-200 bg-red-50 text-red-800';
      case 'moderate': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-orange-200 bg-orange-50 text-orange-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'severe': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="p-6 border-b border-gray-200">
      <h4 className="font-medium text-gray-900 mb-4">Clinical Alerts</h4>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className={`border-l-4 rounded p-3 ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== CART PANEL COMPONENT =====
const CartPanel = ({ cartItems, onUpdateQuantity, onDecreaseQuantity, onRemoveItem, onProcessPayment, mode }) => {

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const insuranceCopay = mode === 'international' ? 5.99 : 0;
  const total = subtotal + tax - insuranceCopay;

  const handlePayment = (method) => {
    if (cartItems.length === 0) {
      alert('No items in cart');
      return;
    }

    alert(`Payment successful via ${method.toUpperCase()}!\nTotal: $${total.toFixed(2)}\nQuantity: ${cartItems.length} items`);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden h-full">

      {/* Cart Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <ReceiptIcon className="w-5 h-5 mr-3 text-blue-600" />
          Cart ({cartItems.length} items)
        </h2>
        {cartItems.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Scroll to see all items • Subtotal: ${subtotal.toFixed(2)}
          </p>
        )}
      </div>

      {/* Cart Items - Scrollable with min-height */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-400">Add medicines from the left panel</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-3">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>

            {/* Bottom spacing to ensure last item is fully visible */}
            <div className="pb-6"></div>
          </div>
        )}
      </div>

      {/* Checkout Section - Fixed at bottom */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <CheckoutSection
            subtotal={subtotal}
            tax={tax}
            insuranceCopay={insuranceCopay}
            total={total}
            mode={mode}
            onProcessPayment={handlePayment}
          />
        </div>
      )}

    </div>
  );
};

// ===== CART ITEM COMPONENT =====
const CartItem = ({ item, onUpdateQuantity, onDecreaseQuantity, onRemoveItem }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">

      {/* Item Info */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
          {item.strength && (
            <p className="text-xs text-gray-600 mt-1">{item.strength}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">${item.price} each</p>
        </div>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="text-red-500 hover:text-red-700 text-lg ml-2"
          title="Remove item"
        >
          ×
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <QuantityControls
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onDecreaseQuantity={onDecreaseQuantity}
        />
        <div className="font-bold text-gray-900 text-right">
          <div className="text-sm">${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      </div>

    </div>
  );
};

// ===== QUANTITY CONTROLS COMPONENT =====
const QuantityControls = ({ item, onUpdateQuantity, onDecreaseQuantity }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDecreaseQuantity(item.id)}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        disabled={item.quantity <= 1}
        title="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="number"
        min="1"
        max={item.stock || 999}
        value={item.quantity}
        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
        className="w-12 h-8 text-center border border-gray-300 rounded"
      />

      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300"
        disabled={item.stock && item.quantity >= item.stock}
        title="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

// ===== CHECKOUT SECTION COMPONENT =====
const CheckoutSection = ({ subtotal, tax, insuranceCopay, total, mode, onProcessPayment }) => {
  return (
    <div className="p-4 space-y-3 max-h-64 overflow-y-auto">

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (8%):</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        {mode === 'international' && insuranceCopay > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Insurance Copay:</span>
            <span>-${insuranceCopay.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-2">
        {mode === 'pakistan' ? (
          <>
            <button
              onClick={() => onProcessPayment('Cash')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium text-lg"
            >
              💵 Cash
            </button>
            <button
              onClick={() => onProcessPayment('Card')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              💳 Card
            </button>
            <button
              onClick={() => onProcessPayment('Wallet')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
            >
              📱 Wallet
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onProcessPayment('Credit Card')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              💳 Credit Card
            </button>
            <button
              onClick={() => onProcessPayment('Insurance')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              🏥 Insurance
            </button>
            <button
              onClick={() => onProcessPayment('Cash')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
            >
              💵 Cash
            </button>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          onClick={() => alert('Sale cancelled')}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded font-medium text-sm"
        >
          Cancel Sale
        </button>
        <button
          onClick={() => onProcessPayment('Cash')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-medium text-sm"
        >
          Complete Sale
        </button>
      </div>

    </div>
  );
};

// ===== FOOTER TOOLBAR COMPONENT =====
const FooterToolbar = ({ mode, verificationChecked, setVerificationChecked }) => {
  const [shortcutUsed, setShortcutUsed] = useState(false);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeypress = (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        alert('Receipt printed');
        return;
      }

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case 'F3':
          e.preventDefault();
          // Only toggle prescription verification in Pakistan mode
          if (mode === 'pakistan') {
            setVerificationChecked(prev => !prev);
            setShortcutUsed(true);
            // Clear visual feedback after 2 seconds
            setTimeout(() => setShortcutUsed(false), 2000);
          }
          break;
        case 'Enter':
          e.preventDefault();
          alert('Add to Cart activated');
          break;
        case 'F4':
          e.preventDefault();
          alert('Edit Quantity activated');
          break;
        case 'F5':
          e.preventDefault();
          alert('Checkout activated');
          break;
        case 'Escape':
          e.preventDefault();
          alert('Cancel Sale activated');
          break;
      }
    };

    document.addEventListener('keydown', handleKeypress);
    return () => document.removeEventListener('keydown', handleKeypress);
  }, [mode, setVerificationChecked]);

  return (
    <footer className="bg-gray-800 text-white px-6 py-3 border-t border-gray-600">
      <div className="flex justify-between items-center text-sm">

        {/* Keyboard Shortcuts */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts:</span>
          </div>
          <div className="flex space-x-3 text-xs">
            <span>F2 = Search</span>
            {mode === 'pakistan' && (
              <span className={`transition-colors ${shortcutUsed ? 'text-green-400 font-bold' : ''}`}>
                F3 = Verify Rx
              </span>
            )}
            <span>Enter = Add</span>
            <span>F4 = Qty</span>
            <span>F5 = Pay</span>
            <span>Esc = Cancel</span>
            <span>Ctrl+P = Print</span>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>Connected to Inventory API</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>{mode === 'pakistan' ? 'Pakistan Server' : 'DEA Compliant'}</span>
          </div>
          {shortcutUsed && mode === 'pakistan' && (
            <div className="text-xs text-green-400 animate-pulse">
              ✓ F3: Rx verification {verificationChecked ? 'checked' : 'unchecked'}
            </div>
          )}
          <div className="text-xs opacity-75">
            v2.1.4 • Last sync: 2 min ago
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PharmacySalesScreen;
