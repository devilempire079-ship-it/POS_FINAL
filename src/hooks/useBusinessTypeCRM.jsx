import { useState, useEffect } from 'react';
import api from '../services/api';

// Business type configuration for unified CRM ↔ POS system
export const BUSINESS_TYPES = {
  pharmacy: {
    name: 'Pharmacy',
    icon: '🏥',
    color: 'green',
    code: 'pharmacy',
    crmTabs: [
      'Clinical Profile',
      'Prescriptions',
      'Refill Reminders',
      'Medication History'
    ],
    crmWorkflows: [
      'autoRefillReminders',
      'clinicalAlerts',
      'drugInteractions',
      'controlledSubstanceTracking'
    ],
    crmMetrics: [
      'rxAdherenceRate',
      'genericSubstitutionSavings',
      'insuranceCaptureRate',
      'pharmacyCollaborationScore'
    ],
    posFeatures: {
      prescriptionRequired: true,
      controlledSubstances: true,
      clinicalOverrideWorkflow: true,
      batchExpiryEnforcement: true
    }
  },
  restaurant: {
    name: 'Restaurant',
    icon: '🍽️',
    color: 'orange',
    code: 'restaurant',
    crmTabs: [
      'Food Preferences',
      'Reservations',
      'Visit History',
      'Table Preferences'
    ],
    crmWorkflows: [
      'birthdayOffers',
      'reservationReminders',
      'vipDiningExperience',
      'feedbackSurveys'
    ],
    crmMetrics: [
      'tableTurnoverRate',
      'averageCheckSize',
      'repeatVisitRate',
      'customerLoyaltyScore'
    ],
    posFeatures: {
      tableManagement: true,
      orderTypes: ['dine-in', 'takeaway', 'delivery'],
      kitchenDisplay: true,
      splitBills: true
    }
  },
  rental: {
    name: 'Rental Services',
    icon: '🚗',
    color: 'blue',
    code: 'rental',
    crmTabs: [
      'Active Contracts',
      'Equipment History',
      'Insurance Details',
      'Return Schedule'
    ],
    crmWorkflows: [
      'reservationReminders',
      'overdueAlerts',
      'depositTracking',
      'maintenanceNotifications'
    ],
    crmMetrics: [
      'equipmentUtilization',
      'onTimeReturnRate',
      'damageIncidentFrequency',
      'revenuePerEquipment'
    ],
    posFeatures: {
      contractManagement: true,
      depositHandling: true,
      schedulingCalendar: true,
      inspectionWorkflow: true
    }
  },
  retail: {
    name: 'Retail',
    icon: '🛍️',
    color: 'purple',
    code: 'retail',
    crmTabs: [
      'Purchase History',
      'Warranty Cards',
      'Support Tickets',
      'Cross-sell Preferences'
    ],
    crmWorkflows: [
      'warrantyReminders',
      'returnExchangeProcessing',
      'upsellSuggestions',
      'loyaltyMilestones'
    ],
    crmMetrics: [
      'inventoryTurnover',
      'returnRate',
      'customerRetentionRate',
      'repeatPurchaseFrequency'
    ],
    posFeatures: {
      warrantyIntegration: true,
      returnsExchangeFlow: true,
      multiChannelInventory: true,
      customerFeedbackLoop: true
    }
  }
};

// Hook for business type detection and CRM configuration
const useBusinessTypeCRM = () => {
  const [businessType, setBusinessType] = useState(null);
  const [crmConfig, setCrmConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeBusinessType = async () => {
      try {
        // Get business type from user settings/API
        // For now, default to pharmacy as it's our initial focus
        const { data } = await api.get('/settings/business-type');

        const type = data.businessType || 'pharmacy';
        const config = BUSINESS_TYPES[type];

        if (!config) {
          throw new Error(`Invalid business type: ${type}`);
        }

        setBusinessType(type);
        setCrmConfig(config);

        // Store in localStorage for quick access
        localStorage.setItem('businessType', type);

      } catch (error) {
        console.warn('Business type not set, defaulting to pharmacy:', error.message);
        // Default to pharmacy for initial development
        const defaultType = 'pharmacy';
        setBusinessType(defaultType);
        setCrmConfig(BUSINESS_TYPES[defaultType]);
        localStorage.setItem('businessType', defaultType);
      } finally {
        setLoading(false);
      }
    };

    initializeBusinessType();
  }, []);

  // Load business-type-specific CRM components
  const loadCRMComponent = async (componentName) => {
    try {
      const modulePath = `./crm/${businessType}/${componentName}`;
      const component = await import(modulePath);
      return component.default;
    } catch (error) {
      console.warn(`CRM component ${componentName} not found for ${businessType}. Using shared component.`);
      // Fallback to shared components
      try {
        const sharedModulePath = `./crm/shared/${componentName}`;
        const component = await import(sharedModulePath);
        return component.default;
      } catch (fallbackError) {
        console.error(`Component ${componentName} not found in shared components either`);
        return null;
      }
    }
  };

  // Get available CRM tabs/workflows based on business type
  const getCRMExtensions = () => {
    if (!crmConfig) return {};

    return {
      tabs: crmConfig.crmTabs || [],
      workflows: crmConfig.crmWorkflows || [],
      metrics: crmConfig.crmMetrics || [],
      features: crmConfig.posFeatures || {}
    };
  };

  return {
    businessType,
    crmConfig,
    loading,
    extensions: getCRMExtensions(),
    loadCRMComponent,
    isPharmacy: businessType === 'pharmacy',
    isRestaurant: businessType === 'restaurant',
    isRental: businessType === 'rental',
    isRetail: businessType === 'retail'
  };
};

export default useBusinessTypeCRM;

// Helper hook for conditional rendering based on business type
export const useCRMConditionalRender = (businessTypes = []) => {
  const { businessType } = useBusinessTypeCRM();

  const shouldRenderFor = businessTypes.includes(businessType);
  const isVisibleFor = shouldRenderFor;

  return { shouldRenderFor, isVisibleFor, currentType: businessType };
};

// Constants for shared CRM features (available to all business types)
export const SHARED_CRM_FEATURES = [
  'customerProfiles',
  'loyaltyProgram',
  'communicationHistory',
  'salesHistory',
  'analytics',
  'marketingCampaigns',
  'feedbackSystem'
];

export const SHARED_CRM_METRICS = [
  'customerLifetimeValue',
  'retentionRate',
  'churnRate',
  'averageOrderValue',
  'purchaseFrequency',
  'loyaltyPointsEarned'
];
