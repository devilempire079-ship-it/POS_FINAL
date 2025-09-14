import React, { useState, memo } from 'react';

// Safe Customer Card Component - Completely rewritten for maximum stability
// No complex operations, extensive null safety, minimal dependencies
const SafeCustomerCard = memo(({ customer, onSelect, onQuickAction }) => {
  const [showExpanded, setShowExpanded] = useState(false);

  // Extremely safe data accessor helper
  const getSafeValue = (obj, path, fallback = 'N/A') => {
    try {
      if (!obj || typeof obj !== 'object') return fallback;
      let result = obj;
      const keys = path.split('.');
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return fallback;
        }
      }
      return result || fallback;
    } catch (error) {
      return fallback;
    }
  };

  // Safe data preparation - no array operations, no complex calculations
  const cardData = {
    id: getSafeValue(customer, 'id', 'unknown'),
    name: getSafeValue(customer, 'name', 'Unknown Patient'),
    email: getSafeValue(customer, 'email', 'No email'),
    phone: getSafeValue(customer, 'phone', 'No phone'),
    points: Number(getSafeValue(customer, 'points', '0').toString().replace(/[^0-9]/g, '')) || 0,
    spent: getSafeValue(customer, 'spent', 'N/A'),
    vipStatus: getSafeValue(customer, 'points', '0') > 500
  };

  // Ultra-safe initials generation
  const getInitials = () => {
    try {
      const name = cardData.name || '';
      const parts = name.split(' ').filter(p => p && p.length > 0);
      if (parts.length >= 2) {
        return (parts[0][0] || '') + (parts[1][0] || '');
      } else if (name.length > 0) {
        return name[0].toUpperCase();
      }
      return '??';
    } catch (error) {
      return '??';
    }
  };

  const handleCardClick = () => {
    if (onSelect && typeof onSelect === 'function') {
      try {
        onSelect(customer || {});
      } catch (error) {
        console.warn('Error in onSelect callback:', error);
      }
    }
  };

  const handleQuickAction = (action) => {
    if (onQuickAction && typeof onQuickAction === 'function') {
      try {
        onQuickAction(action, customer || {});
      } catch (error) {
        console.warn('Error in quick action callback:', error);
      }
    }
  };

  // Determine risk level safely
  const getRiskLevel = () => {
    try {
      return cardData.points > 1000 ? 'high' : cardData.points > 100 ? 'medium' : 'low';
    } catch (error) {
      return 'low';
    }
  };

  const riskLevel = getRiskLevel();

  const riskStyles = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-green-300 bg-green-50'
  };

  const vipStyles = cardData.vipStatus
    ? 'border-yellow-400 bg-yellow-50'
    : riskStyles[riskLevel] || 'border-gray-300 bg-gray-50';

  return (
    <div
      className={`rounded-lg border-2 ${vipStyles} p-4 mb-4 cursor-pointer hover:shadow-lg transition-all duration-200 max-w-3xl mx-auto`}
      onClick={handleCardClick}
    >
      {/* Basic Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Safe Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {getInitials()}
          </div>

          {/* Safe Name and VIP Badge */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {cardData.name}
              </h3>
              {cardData.vipStatus && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                  VIP
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate mt-1">
              {cardData.email} • {cardData.phone}
            </p>
          </div>
        </div>

        {/* Safe Stats */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-gray-600">Points</div>
          <div className="font-bold text-lg">{cardData.points.toLocaleString()}</div>
        </div>
      </div>

      {/* Safe Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAction('call');
            }}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded transition-colors"
          >
            📞 Call
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAction('message');
            }}
            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded transition-colors"
          >
            💬 Message
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowExpanded(!showExpanded);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          {showExpanded ? 'Show Less' : 'View Details'}
        </button>
      </div>

      {/* Safe Expanded Details */}
      {showExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Patient Info</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {cardData.name}</div>
                <div><span className="font-medium">Email:</span> {cardData.email}</div>
                <div><span className="font-medium">Phone:</span> {cardData.phone}</div>
                <div><span className="font-medium">Points:</span> {cardData.points}</div>
                <div><span className="font-medium">Spent:</span> {cardData.spent}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Medical Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {riskLevel === 'high' ? 'High Risk' :
                     riskLevel === 'medium' ? 'Medium Risk' :
                     'Low Risk'} Patient
                  </span>
                </div>
                <div><span className="font-medium">VIP Status:</span> {cardData.vipStatus ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Total Spent:</span> {cardData.spent}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SafeCustomerCard.displayName = 'SafeCustomerCard';

export default SafeCustomerCard;
