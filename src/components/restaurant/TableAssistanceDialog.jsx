import React, { useState } from 'react';
import {
  Bell,
  Utensils,
  Droplets,
  Wrench,
  Clock,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Users,
  ChefHat,
  Save,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';

const TableAssistanceDialog = ({
  selectedTable,
  user,
  onClose,
  onRequestSubmitted
}) => {
  const [assistanceType, setAssistanceType] = useState('');
  const [priority, setPriority] = useState('normal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assistanceTypes = [
    {
      id: 'cleanup',
      name: 'Table Cleanup',
      icon: Droplets,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Spills, crumbs, dirty dishes'
    },
    {
      id: 'supplies',
      name: 'Supplies Needed',
      icon: Utensils,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Napkins, silverware, menus'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: Wrench,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Broken chairs, lighting issues'
    },
    {
      id: 'special_request',
      name: 'Special Request',
      icon: Bell,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Birthday celebrations, VIP service'
    },
    {
      id: 'customer_service',
      name: 'Customer Issue',
      icon: Users,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Complaints, questions, special needs'
    },
    {
      id: 'kitchen_issue',
      name: 'Kitchen Issue',
      icon: ChefHat,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Food quality, dietary concerns'
    }
  ];

  const priorityOptions = [
    {
      id: 'urgent',
      name: 'Urgent',
      color: 'bg-red-100 text-red-800',
      description: 'Immediate attention required'
    },
    {
      id: 'important',
      name: 'Important',
      color: 'bg-orange-100 text-orange-800',
      description: 'Handle within 5 minutes'
    },
    {
      id: 'normal',
      name: 'Normal',
      color: 'bg-green-100 text-green-800',
      description: 'Handle when convenient'
    }
  ];

  const handleSubmit = async () => {
    console.log('🔍 BUTTON CLICKED: handleSubmit started');

    if (!assistanceType || !description.trim()) {
      alert('Please select an assistance type and provide a description.');
      return;
    }

    console.log('🔍 Debug: Starting assistance request submit...');
    console.log('User object:', user);
    console.log('Selected table:', selectedTable);
    console.log('API token present:', !!localStorage.getItem('authToken'));
    console.log('Assistance type:', assistanceType);
    console.log('Priority:', priority);
    console.log('Description:', description);

    setIsSubmitting(true);

    try {
      console.log('🔍 Creating assistance request payload...');
      const assistanceRequest = {
        tableId: selectedTable?.id,
        tableNumber: selectedTable?.number,
        serverId: user?.id || 'unknown',
        serverName: user?.name || 'Server',
        assistanceType,
        priority,
        description: description.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      console.log('🔍 Final payload:', assistanceRequest);

      // Validate essential fields (table is now optional)
      if (!assistanceType) {
        console.error('🔍 Validation failed: missing assistance type');
        alert('Please select an assistance type.');
        return;
      }

      console.log('🔍 Calling API...');
      const result = await api.post('/assistance-requests', assistanceRequest);
      console.log('✅ API call completed, result:', result);

      if (result && result.assistanceRequest) {
        console.log('✅ Response validation passed');

        // Send notification - but don't fail the request if this fails
        try {
          console.log('🔍 Sending notification...');
          const tableInfo = selectedTable ? `Table ${selectedTable.number}` : 'General';
          const notifyResult = await api.post('/notifications', {
            type: 'assistance_request',
            title: `Assistance Requested - ${tableInfo}`,
            message: `${assistanceTypes.find(type => type.id === assistanceType)?.name}: ${description.slice(0, 50)}...`,
            priority,
            initiatedBy: user?.name || 'Server',
            location: selectedTable ? `Table ${selectedTable.number}` : 'General Assistance',
            timestamp: new Date().toISOString()
          });
          console.log('✅ Notification sent successfully');
        } catch (notifyError) {
          console.warn('⚠️ Notification failed, but assistance request succeeded:', notifyError);
          // Don't fail the whole request for notification failures
        }

        console.log('🎉 SUCCESS: Assistance request submitted!');
        alert('Assistance request submitted successfully!');
        onRequestSubmitted?.(assistanceRequest);
        onClose();
      } else {
        console.error('❌ Invalid response format:', result);
        alert('Server returned unexpected response. Please try again.');
        return;
      }

    } catch (error) {
      console.error('❌ ERROR caught in try-catch:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Specific error handling
      if (error.message && error.message.includes('Failed to fetch')) {
        alert('Network error: Cannot connect to server. Please check if the server is running.');
      } else if (error.message && error.message.includes('401')) {
        alert('Authentication error: Please log out and log back in.');
      } else if (error.message && error.message.includes('Authentication required')) {
        alert('Authentication error: Please log out and log back in.');
      } else if (error.message && error.message.includes('400')) {
        alert('Invalid data submitted. Please check your input.');
      } else if (error.message && error.message.includes('500')) {
        alert('Server error. Please try again in a moment.');
      } else {
        alert(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      console.log('🔍 Finally block executed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="w-6 h-6 mr-2 text-orange-600" />
            {selectedTable ? 'Request Table Assistance' : 'Request Assistance'}
            {selectedTable && (
              <Badge variant="outline" className="ml-2">
                Table {typeof selectedTable.number === 'string' ? selectedTable.number : `T${selectedTable.number}`}
              </Badge>
            )}
            {!selectedTable && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                General Request
              </Badge>
            )}
          </CardTitle>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Table Info */}
          {selectedTable && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium">Table Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Table:</span>
                  <span className="ml-2 font-medium">
                    {typeof selectedTable.number === 'string' ? selectedTable.number : `T${selectedTable.number}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-2 font-medium">{selectedTable.capacity} seats</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedTable.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Server:</span>
                  <span className="ml-2 font-medium">{user?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Assistance Type Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              What assistance do you need?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assistanceTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setAssistanceType(type.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      assistanceType === type.id
                        ? `${type.color} border-current shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Priority Level
            </h3>
            <div className="flex space-x-3">
              {priorityOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setPriority(option.id)}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                    priority === option.id
                      ? `${option.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-xs mt-1">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
              Additional Details
            </h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Please provide more details about your request... ${assistanceType ? `(${assistanceTypes.find(type => type.id === assistanceType)?.description})` : ''}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-2">
              This information will be sent to management and staff to ensure quick resolution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !assistanceType || !description.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableAssistanceDialog;
