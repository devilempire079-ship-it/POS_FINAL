import React, { useState, useCallback } from 'react';
import { Car, Clock, CheckCircle, AlertTriangle, Settings, Play } from 'lucide-react';

const DriveThruLaneManager = ({
  lanes = [],
  onLaneUpdate,
  onOrderAssign,
  currentOrder,
  orderType
}) => {
  const [selectedLane, setSelectedLane] = useState(null);

  // Lane status configuration
  const statusConfig = {
    available: {
      icon: '🟢',
      color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
      label: 'Available',
      description: 'Ready for next customer'
    },
    busy: {
      icon: '🟡',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
      label: 'Busy',
      description: 'Processing order'
    },
    maintenance: {
      icon: '🔴',
      color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
      label: 'Maintenance',
      description: 'Temporarily closed'
    },
    pending: {
      icon: '🔵',
      color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
      label: 'Pending',
      description: 'Waiting for customer'
    }
  };

  // Handle lane status update
  const handleLaneStatusUpdate = useCallback((laneId, newStatus) => {
    if (onLaneUpdate) {
      onLaneUpdate(laneId, newStatus);
    }
  }, [onLaneUpdate]);

  // Handle order assignment to lane
  const handleOrderAssignment = useCallback((laneId) => {
    if (currentOrder && onOrderAssign) {
      onOrderAssign(laneId, currentOrder.id);
      setSelectedLane(laneId);
    }
  }, [currentOrder, onOrderAssign]);

  // Handle lane click
  const handleLaneClick = useCallback((lane) => {
    if (lane.status === 'available' && currentOrder && orderType === 'drive_thru') {
      handleOrderAssignment(lane.id);
    } else {
      setSelectedLane(selectedLane === lane.id ? null : lane.id);
    }
  }, [selectedLane, currentOrder, orderType, handleOrderAssignment]);

  // Quick status actions
  const quickActions = [
    { status: 'available', label: 'Mark Available', icon: CheckCircle },
    { status: 'busy', label: 'Mark Busy', icon: Clock },
    { status: 'maintenance', label: 'Maintenance', icon: Settings },
    { status: 'pending', label: 'Mark Pending', icon: Play }
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Car className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Drive-Thru Lanes
          </h3>
        </div>
        <div className="text-sm text-gray-600">
          {lanes.filter(lane => lane.status === 'available').length} available
        </div>
      </div>

      {/* Lane Status Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {lanes.map(lane => {
          const config = statusConfig[lane.status] || statusConfig.available;
          const isSelected = selectedLane === lane.id;
          const canAssignOrder = lane.status === 'available' && currentOrder && orderType === 'drive_thru';

          return (
            <div
              key={lane.id}
              onClick={() => handleLaneClick(lane)}
              className={`
                border-2 rounded-lg p-3 text-center transition-all cursor-pointer
                ${config.color}
                ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                ${canAssignOrder ? 'animate-pulse' : ''}
              `}
            >
              <div className="text-lg mb-1">{config.icon}</div>
              <div className="font-semibold text-sm">{lane.name}</div>
              <div className="text-xs opacity-75">{config.label}</div>

              {/* Current Order Indicator */}
              {lane.currentOrder && (
                <div className="mt-2 text-xs bg-white bg-opacity-50 rounded px-2 py-1">
                  Order #{lane.currentOrder}
                </div>
              )}

              {/* Assignment Hint */}
              {canAssignOrder && (
                <div className="mt-2 text-xs bg-blue-200 text-blue-800 rounded px-2 py-1">
                  Click to assign order
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lane Management Controls */}
      {selectedLane && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800">
              Lane {lanes.find(l => l.id === selectedLane)?.name} Controls
            </h4>
            <button
              onClick={() => setSelectedLane(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.status}
                  onClick={() => handleLaneStatusUpdate(selectedLane, action.status)}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Assignment Status */}
      {currentOrder && orderType === 'drive_thru' && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Order #{currentOrder.id} ready for lane assignment
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Click on an available lane to assign this order
          </div>
        </div>
      )}

      {/* Lane Statistics */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
        <div className="bg-green-50 text-green-700 rounded px-2 py-1 text-center">
          {lanes.filter(l => l.status === 'available').length} Available
        </div>
        <div className="bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-center">
          {lanes.filter(l => l.status === 'busy').length} Busy
        </div>
        <div className="bg-red-50 text-red-700 rounded px-2 py-1 text-center">
          {lanes.filter(l => l.status === 'maintenance').length} Maintenance
        </div>
        <div className="bg-blue-50 text-blue-700 rounded px-2 py-1 text-center">
          {lanes.filter(l => l.status === 'pending').length} Pending
        </div>
      </div>
    </div>
  );
};

export default DriveThruLaneManager;
