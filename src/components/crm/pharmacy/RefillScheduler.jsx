import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../../services/api';

const RefillScheduler = ({ customer, onRefillScheduled }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refillsDue, setRefillsDue] = useState([]);
  const [scheduledReminders, setScheduledReminders] = useState([]);

  useEffect(() => {
    if (customer?.id) {
      loadCustomerPrescriptions();
    }
  }, [customer?.id]);

  const loadCustomerPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/prescriptions/customer/${customer.id}`);
      setPrescriptions(data.prescriptions || []);

      // Calculate refills due (basic logic - can be enhanced)
      const dueRefills = data.prescriptions
        .filter(rx => {
          // Check if refill is due within next 7 days
          const nextRefillDate = new Date(rx.dateFilled || rx.dateWritten);
          nextRefillDate.setDate(nextRefillDate.getDate() + (rx.daysSupply || 30));
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          return nextRefillDate <= sevenDaysFromNow && rx.refillsRemaining > 0;
        })
        .map(rx => ({
          ...rx,
          daysUntilDue: calculateDaysUntilDue(rx),
          status: getRefillStatus(rx)
        }));

      setRefillsDue(dueRefills);

    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilDue = (prescription) => {
    const lastFilled = new Date(prescription.dateFilled || prescription.dateWritten);
    lastFilled.setDate(lastFilled.getDate() + (prescription.daysSupply || 30));

    const today = new Date();
    const diffTime = lastFilled.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getRefillStatus = (prescription) => {
    const daysUntilDue = calculateDaysUntilDue(prescription);

    if (daysUntilDue === 0) return 'due';
    if (daysUntilDue <= 3) return 'urgent';
    return 'upcoming';
  };

  const scheduleRefillReminder = async (prescription, channel, remindDate) => {
    try {
      await api.post('/notifications/schedule-refill-reminder', {
        prescriptionId: prescription.id,
        customerId: customer.id,
        channel, // 'sms', 'whatsapp', 'email'
        remindDate,
        medicationName: prescription.medicationName,
        daysSupply: prescription.daysSupply
      });

      // Update local state
      setScheduledReminders(prev => [
        ...prev,
        {
          id: `reminder-${prescription.id}-${Date.now()}`,
          prescriptionId: prescription.id,
          channel,
          scheduledFor: remindDate,
          status: 'scheduled'
        }
      ]);

      // Notify parent component
      if (onRefillScheduled) {
        onRefillScheduled(prescription, channel, remindDate);
      }

    } catch (error) {
      console.error('Failed to schedule refill reminder:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'due':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'due':
        return 'bg-red-100 border-red-200';
      case 'urgent':
        return 'bg-orange-100 border-orange-200';
      case 'upcoming':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-green-100 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading refill schedule...</span>
      </div>
    );
  }

  return (
    <div className="pharmacy-refill-scheduler space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Automated Refill Scheduler
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Schedule automated refill reminders for {customer?.firstName}'s prescriptions
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{refillsDue.length}</div>
          <div className="text-xs text-gray-500">Due Soon</div>
        </div>
      </div>

      {/* Refills Due This Week */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Refills Due This Week
        </h4>

        {refillsDue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>No refills due this week</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refillsDue.map((refill) => (
              <div
                key={refill.id}
                className={`p-4 rounded-lg border ${getStatusColor(refill.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(refill.status)}
                      <h5 className="font-medium text-gray-900">
                        {refill.medicationName}
                      </h5>
                      <span className="text-xs bg-white px-2 py-1 rounded-full">
                        {refill.refillsRemaining} refills left
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Strength: {refill.strength}</p>
                      <p>Days Supply: {refill.daysSupply}</p>
                      <p>Due in: {refill.daysUntilDue} days</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const remindDate = new Date();
                        remindDate.setDate(remindDate.getDate() + 7);
                        scheduleRefillReminder(refill, 'sms', remindDate);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>SMS</span>
                    </button>

                    <button
                      onClick={() => {
                        const remindDate = new Date();
                        remindDate.setDate(remindDate.getDate() + 7);
                        scheduleRefillReminder(refill, 'whatsapp', remindDate);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Reminders */}
      {scheduledReminders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Scheduled Reminders
          </h4>

          <div className="space-y-3">
            {scheduledReminders.map((reminder) => {
              const refill = prescriptions.find(rx => rx.id === reminder.prescriptionId);
              return (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {refill?.medicationName || 'Unknown medication'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reminder.channel.toUpperCase()} reminder on {reminder.scheduledFor.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {reminder.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-Refill Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Auto-Refill Preferences
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-refill eligible prescriptions</p>
              <p className="text-sm text-gray-600">Automatically schedule refills when supplies run low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Advance reminders</p>
              <p className="text-sm text-gray-600">Send reminders 7 days before refill due date</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefillScheduler;
