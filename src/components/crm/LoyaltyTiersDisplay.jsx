import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const LoyaltyTiersDisplay = ({ customer }) => {
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyTiers = async () => {
      try {
        const tiers = await api.getLoyaltyTiers();
        setLoyaltyTiers(tiers);
      } catch (error) {
        console.error('Failed to fetch loyalty tiers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyTiers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Loyalty Tiers</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loyaltyTiers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Loyalty Tiers</h3>
        <p className="text-gray-500">No loyalty tiers have been configured yet.</p>
      </div>
    );
  }

  // Sort tiers by minimum points
  const sortedTiers = [...loyaltyTiers].sort((a, b) => a.minPoints - b.minPoints);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Loyalty Tiers</h3>
      <div className="space-y-4">
        {sortedTiers.map((tier, index) => {
          const isCurrentTier = customer && customer.loyaltyTier === tier.name;
          const isLocked = customer && customer.loyaltyPoints < tier.minPoints;
          
          return (
            <div 
              key={tier.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isCurrentTier 
                  ? 'border-blue-500 bg-blue-50' 
                  : isLocked 
                    ? 'border-gray-200 bg-gray-50 opacity-70' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tier.color || '#cccccc' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center">
                      {tier.name}
                      {isCurrentTier && (
                        <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {tier.minPoints}+ points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {tier.pointsMultiplier}x
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
              </div>
              
              {tier.benefits && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{tier.benefits}</p>
                </div>
              )}
              
              {customer && customer.loyaltyPoints < tier.minPoints && (
                <div className="mt-2 text-sm text-orange-600">
                  Earn {tier.minPoints - customer.loyaltyPoints} more points to reach this tier
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-2">How It Works</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Earn 1 point for every $10 spent</li>
          <li>• Higher tiers multiply your points earnings</li>
          <li>• Points never expire</li>
          <li>• Redeem 20+ points for discounts</li>
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyTiersDisplay;