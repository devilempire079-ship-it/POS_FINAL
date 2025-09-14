import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LoyaltyPointsDisplay = ({ customer, onPointsRedeemed, usedPoints = 0 }) => {
  const [showRedemption, setShowRedemption] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);

  useEffect(() => {
    const fetchLoyaltyTiers = async () => {
      try {
        const tiers = await api.getLoyaltyTiers();
        setLoyaltyTiers(tiers);
      } catch (error) {
        console.error('Failed to fetch loyalty tiers:', error);
      }
    };

    fetchLoyaltyTiers();
  }, []);

  if (!customer) {
    return null;
  }

  const availablePoints = customer.loyaltyPoints - usedPoints;
  const canRedeem = availablePoints >= 20; // Minimum 20 points for redemption

  // Get current tier
  const currentTier = loyaltyTiers.find(tier => tier.name === customer.loyaltyTier) || null;
  
  // Get next tier
  const nextTier = loyaltyTiers
    .filter(tier => tier.minPoints > customer.loyaltyPoints)
    .sort((a, b) => a.minPoints - b.minPoints)[0] || null;

  const handleRedeemPoints = async () => {
    const points = parseInt(pointsToRedeem);

    if (!points || points < 20) {
      toast.error('Minimum redemption is 20 points');
      return;
    }

    if (points > availablePoints) {
      toast.error('Not enough points available');
      return;
    }

    try {
      setIsRedeeming(true);
      const response = await api.redeemLoyaltyPoints({
        customerId: customer.id,
        pointsToRedeem: points
      });

      toast.success(`Redeemed ${points} points for $${response.redeemableAmount} discount`);
      onPointsRedeemed(response.redeemableAmount, points);
      setPointsToRedeem('');
      setShowRedemption(false);
    } catch (error) {
      console.error('Points redemption error:', error);
      toast.error('Failed to redeem points');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getPointsToDollarValue = (points) => {
    return (points * 0.05).toFixed(2);
  };

  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    if (!nextTier) return 100;
    if (!currentTier) {
      return Math.min((customer.loyaltyPoints / nextTier.minPoints) * 100, 100);
    }
    
    const progress = ((customer.loyaltyPoints - currentTier.minPoints) / 
                     (nextTier.minPoints - currentTier.minPoints)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-green-600">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div className="font-medium text-green-800">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-sm text-green-600">
              {customer.loyaltyPoints} Loyalty Points
              {availablePoints !== customer.loyaltyPoints && (
                <span className="text-orange-600"> • {usedPoints} used</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canRedeem && (
            <button
              onClick={() => setShowRedemption(!showRedemption)}
              className="px-6 py-3 bg-green-600 text-lg font-semibold text-white rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 touch-action-manipulation"
            >
              🎁 Redeem Points
            </button>
          )}
        </div>
      </div>

      {/* Tier Information */}
      {currentTier && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: currentTier.color || '#cccccc' }}
              ></div>
              <span className="font-semibold text-gray-800">
                {currentTier.name} Tier
              </span>
              <span className="text-sm text-gray-600">
                ({currentTier.pointsMultiplier}x points)
              </span>
            </div>
            {nextTier && (
              <span className="text-sm text-gray-600">
                {nextTier.minPoints - customer.loyaltyPoints} pts to {nextTier.name}
              </span>
            )}
          </div>
          
          {nextTier && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressToNextTier()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Progress to {nextTier.name} tier
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redemption Form */}
      {showRedemption && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="text-sm text-green-700 mb-2">
            Available: {availablePoints} points (${getPointsToDollarValue(availablePoints)})
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              min="20"
              max={availablePoints}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder="Points to redeem"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleRedeemPoints}
              disabled={isRedeeming}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isRedeeming ? 'Redeeming...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setShowRedemption(false);
                setPointsToRedeem('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
          {pointsToRedeem && parseInt(pointsToRedeem) >= 20 && (
            <div className="mt-2 text-sm text-green-700">
              Redeem {pointsToRedeem} points for ${getPointsToDollarValue(parseInt(pointsToRedeem))} discount
            </div>
          )}
        </div>
      )}

      {/* Points Value Information */}
      <div className="mt-3 text-xs text-green-600">
        • 20-49 points = $1.00 discount (5¢ per point)
        • 50-99 points = $2.50 discount (5¢ per point)
        • 100+ points = $5.00 discount (5¢ per point)
        {availablePoints > 0 && (
          <>
            <br />
            • Your {availablePoints} points = ${getPointsToDollarValue(availablePoints)} value
          </>
        )}
        {currentTier && (
          <>
            <br />
            • {currentTier.name} tier: {currentTier.pointsMultiplier}x points multiplier
          </>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPointsDisplay;