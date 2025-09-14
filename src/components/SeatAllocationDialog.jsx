import React, { useState, useEffect } from 'react';
import { Users, Plus, Minus, CheckCircle, AlertCircle, X } from 'lucide-react';

const SeatAllocationDialog = ({
  isOpen,
  onClose,
  table,
  onAllocateSeats,
  currentOrder = null
}) => {
  const [customerCount, setCustomerCount] = useState(1);
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-set requested seats based on customer count
  useEffect(() => {
    if (customerCount > 0) {
      setRequestedSeats(customerCount);
    }
  }, [customerCount]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && table) {
      setCustomerCount(1);
      setRequestedSeats(1);
      setNotes('');
    }
  }, [isOpen, table]);

  if (!isOpen || !table) return null;

  const handleSubmit = async () => {
    if (requestedSeats <= 0) {
      alert('Please enter a valid number of seats');
      return;
    }

    if (requestedSeats > table.capacity) {
      alert(`Cannot allocate more seats than table capacity (${table.capacity})`);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await onAllocateSeats(table.id, requestedSeats, customerCount);
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Failed to allocate seats');
      }
    } catch (error) {
      alert('Error allocating seats: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getEfficiencyColor = () => {
    if (!table.capacity) return 'text-gray-500';
    const efficiency = requestedSeats / table.capacity;
    if (efficiency <= 0.6) return 'text-green-600'; // Good fit
    if (efficiency <= 0.8) return 'text-yellow-600'; // Okay fit
    return 'text-red-600'; // Poor fit
  };

  const getEfficiencyText = () => {
    if (!table.capacity) return '';
    const efficiency = requestedSeats / table.capacity;
    if (efficiency <= 0.6) return 'Excellent fit';
    if (efficiency <= 0.8) return 'Good fit';
    return 'Seats may be tight';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm transform transition-all duration-200">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Table {table.number}</h3>
              <p className="text-xs text-gray-600">{table.capacity} seats available</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Compact Form */}
        <div className="p-4 space-y-4">
          {/* Customer Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customers
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                value={customerCount}
                onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-lg font-semibold border border-gray-300 rounded px-2 py-1"
                min="1"
              />
              <button
                onClick={() => setCustomerCount(customerCount + 1)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Seat Allocation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seats Needed
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRequestedSeats(Math.max(1, requestedSeats - 1))}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                value={requestedSeats}
                onChange={(e) => setRequestedSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-lg font-semibold border border-gray-300 rounded px-2 py-1"
                min="1"
                max={table.capacity}
              />
              <button
                onClick={() => setRequestedSeats(Math.min(table.capacity, requestedSeats + 1))}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Compact Efficiency Indicator */}
            <div className="mt-2 flex items-center justify-center space-x-2">
              <span className={`text-xs ${getEfficiencyColor()}`}>
                {getEfficiencyText()}
              </span>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    requestedSeats / table.capacity <= 0.6 ? 'bg-green-500' :
                    requestedSeats / table.capacity <= 0.8 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${(requestedSeats / table.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Compact Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests..."
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Warning */}
          {requestedSeats > (table.availableSeats || table.capacity) && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-800">Not enough seats</span>
              </div>
            </div>
          )}
        </div>

        {/* Compact Action Buttons */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || requestedSeats > (table.availableSeats || table.capacity)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? '...' : 'Allocate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatAllocationDialog;
