import React, { useState, useEffect } from 'react';

const NumericKeypad = ({ value, onChange, onConfirm, onCancel, title = "Enter Amount" }) => {
  const [currentValue, setCurrentValue] = useState(value || '');

  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  const handleKeyPress = (key) => {
    if (key === 'clear') {
      setCurrentValue('');
    } else if (key === 'backspace') {
      setCurrentValue(prev => prev.slice(0, -1));
    } else {
      setCurrentValue(prev => prev + key);
    }
  };

  const handleConfirm = () => {
    const numericValue = parseFloat(currentValue) || 0;
    if (onConfirm) {
      onConfirm(numericValue);
    } else {
      onChange(numericValue);
    }
  };

  const keys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '.', '00'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 text-center">{title}</h2>
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full text-center text-3xl font-mono font-bold bg-transparent border-none outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {keys.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-2xl font-semibold py-4 rounded-lg touch-action-manipulation transition-colors"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleKeyPress('clear')}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-4 rounded-lg text-lg touch-action-manipulation"
            >
              Clear
            </button>
            <button
              onClick={() => handleKeyPress('backspace')}
              className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-semibold py-4 rounded-lg text-lg touch-action-manipulation"
            >
              ⌫
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold py-4 rounded-lg text-lg touch-action-manipulation"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xl py-4 rounded-lg touch-action-manipulation transition-colors"
          >
            ✓ Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericKeypad;
