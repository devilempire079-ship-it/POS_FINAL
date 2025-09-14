import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  X,
  Check,
  Plus,
  Minus,
  Calculator
} from 'lucide-react';

const SplitPaymentDialog = ({
  totalAmount,
  onApply,
  onClose
}) => {
  const [payments, setPayments] = useState([
    { method: 'cash', amount: 0, reference: '' }
  ]);
  const [remainingAmount, setRemainingAmount] = useState(totalAmount);
  const [totalPaid, setTotalPaid] = useState(0);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
    { value: 'mobile_payment', label: 'Mobile Payment', icon: CreditCard }
  ];

  // Calculate totals whenever payments change
  useEffect(() => {
    const paid = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    setTotalPaid(paid);
    setRemainingAmount(Math.max(0, totalAmount - paid));
  }, [payments, totalAmount]);

  const addPaymentMethod = () => {
    setPayments([...payments, { method: 'cash', amount: 0, reference: '' }]);
  };

  const removePaymentMethod = (index) => {
    if (payments.length > 1) {
      const newPayments = payments.filter((_, i) => i !== index);
      setPayments(newPayments);
    }
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const handleAmountChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    updatePayment(index, 'amount', numValue);
  };

  const applyRemainingToPayment = (index) => {
    updatePayment(index, 'amount', remainingAmount);
  };

  const handleApply = () => {
    if (remainingAmount === 0 && totalPaid >= totalAmount) {
      onApply(payments.filter(p => p.amount > 0));
    }
  };

  const getPaymentIcon = (method) => {
    const methodData = paymentMethods.find(m => m.value === method);
    const IconComponent = methodData?.icon || DollarSign;
    return <IconComponent className="h-5 w-5" />;
  };

  const isValid = remainingAmount === 0 && totalPaid >= totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Split Payment</h3>
                <p className="text-purple-100 text-sm">
                  Total: ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Due</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Paid</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${remainingAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Payment Methods</h4>
              <button
                onClick={addPaymentMethod}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors touch-manipulation"
              >
                <Plus className="h-4 w-4" />
                <span>Add Payment</span>
              </button>
            </div>

            {payments.map((payment, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {getPaymentIcon(payment.method)}
                    </div>
                    <span className="font-medium text-gray-900">
                      Payment {index + 1}
                    </span>
                  </div>
                  {payments.length > 1 && (
                    <button
                      onClick={() => removePaymentMethod(index)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Method
                    </label>
                    <select
                      value={payment.method}
                      onChange={(e) => updatePayment(index, 'method', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2 pl-8 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                        step="0.01"
                      />
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Quick Amount Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Amount
                    </label>
                    <button
                      onClick={() => applyRemainingToPayment(index)}
                      disabled={remainingAmount === 0}
                      className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors touch-manipulation"
                    >
                      Remaining (${remainingAmount.toFixed(2)})
                    </button>
                  </div>
                </div>

                {/* Reference for card payments */}
                {(payment.method === 'credit_card' || payment.method === 'debit_card') && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference/Card Last 4
                    </label>
                    <input
                      type="text"
                      value={payment.reference}
                      onChange={(e) => updatePayment(index, 'reference', e.target.value)}
                      placeholder="****1234"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      maxLength="20"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h5>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                payment.amount > 0 && (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getPaymentIcon(payment.method)}
                      <span className="text-gray-700 capitalize">
                        {payment.method.replace('_', ' ')}
                        {payment.reference && ` (${payment.reference})`}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                )
              ))}
              <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total Paid:</span>
                <span className="text-blue-600">${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {remainingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div>
                  <div className="font-medium text-yellow-800">Payment Incomplete</div>
                  <div className="text-yellow-700 text-sm">
                    ${remainingAmount.toFixed(2)} still needed to complete payment
                  </div>
                </div>
              </div>
            </div>
          )}

          {totalPaid > totalAmount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✓</div>
                <div>
                  <div className="font-medium text-green-800">Change Due</div>
                  <div className="text-green-700 text-sm">
                    ${(totalPaid - totalAmount).toFixed(2)} change to customer
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!isValid}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>Complete Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentDialog;
