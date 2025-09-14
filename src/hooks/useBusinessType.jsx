import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';

const BusinessTypeContext = createContext();

export const useBusinessType = () => {
  const context = useContext(BusinessTypeContext);
  if (!context) {
    throw new Error('useBusinessType must be used within a BusinessTypeProvider');
  }
  return context;
};

export const BusinessTypeProvider = ({ children }) => {
  // Get authentication status
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // Restaurant subtypes configuration
  const restaurantSubtypes = {
    fine_dining: {
      name: 'Fine Dining',
      description: 'Full-service restaurant with tables, reservations, and formal service',
      icon: '🥂',
      features: {
        tables: true,
        reservations: true,
        counter: false,
        driveThru: false,
        takeout: true,
        delivery: false
      },
      defaultOrderType: 'dine_in'
    },
    casual: {
      name: 'Casual Dining',
      description: 'Casual restaurant with tables and counter service options',
      icon: '🍽️',
      features: {
        tables: true,
        reservations: false,
        counter: true,
        driveThru: false,
        takeout: true,
        delivery: false
      },
      defaultOrderType: 'dine_in'
    },
    quick_service: {
      name: 'Quick Service Restaurant',
      description: 'Fast food with counter service and drive-through',
      icon: '🍔',
      features: {
        tables: false,
        reservations: false,
        counter: true,
        driveThru: true,
        takeout: true,
        delivery: false
      },
      defaultOrderType: 'counter'
    }
  };

  // Fallback business types when API is not available
  const fallbackBusinessTypes = [
    {
      id: 1,
      code: 'retail',
      name: 'Retail Store',
      description: 'General retail products and merchandise',
      icon: '🏪',
      sortOrder: 1,
      isActive: true,
      subtypes: null
    },
    {
      id: 2,
      code: 'restaurant',
      name: 'Restaurant',
      description: 'Food and beverage service establishment',
      icon: '🍽️',
      sortOrder: 2,
      isActive: true,
      subtypes: restaurantSubtypes,
      defaultSubtype: 'casual'
    },
    {
      id: 3,
      code: 'repair',
      name: 'Repair/Service',
      description: 'Service and repair business with parts inventory',
      icon: '⚙️',
      sortOrder: 3,
      isActive: true,
      subtypes: null
    },
    {
      id: 4,
      code: 'pharmacy',
      name: 'Pharmacy',
      description: 'Medical and pharmaceutical products',
      icon: '⚕️',
      sortOrder: 4,
      isActive: true,
      subtypes: null
    },
    {
      id: 5,
      code: 'rental',
      name: 'Equipment Rental',
      description: 'Equipment and tool rental business',
      icon: '📦',
      sortOrder: 5,
      isActive: true,
      subtypes: null
    }
  ];

  // FORCE PHARMACY MODE for testing - comment out to return to dynamic mode
  const pharmacyBusinessType = fallbackBusinessTypes[3]; // Pharmacy
  const [businessType, setBusinessType] = useState(pharmacyBusinessType);
  const [storeSettings, setStoreSettings] = useState({ businessType: pharmacyBusinessType, storeName: 'My POS Store' });
  const [businessTypes, setBusinessTypes] = useState(fallbackBusinessTypes);
  const [loading, setLoading] = useState(false); // Start as false to prevent loading state
  const [error, setError] = useState(null);

  // Load business types and current settings
  const loadBusinessTypeData = async () => {
    console.log('Loading business type data...');
    try {
      setLoading(true);
      setError(null);

      // Always start with pharmacy business type as default to test pharmacy screen
      const defaultBusinessType = fallbackBusinessTypes[3]; // Pharmacy

      // Set initial state immediately to prevent blank screen
      setBusinessType(defaultBusinessType);
      setBusinessTypes(fallbackBusinessTypes);
      setStoreSettings({
        businessType: defaultBusinessType,
        storeName: 'My POS Store'
      });

      // Check if user is authenticated BEFORE making API calls
      const token = localStorage.getItem('pos_token');
      const hasValidToken = token && api.token;

      if (!hasValidToken) {
        console.log('No authentication token found, using fallback business types');
        setLoading(false);
        return;
      }

      console.log('Authentication token found, attempting to load from API...');

      // Only make API calls if authenticated
      try {
        // Try API calls with a reasonable timeout
        const apiCall = Promise.all([
          api.get('/business-types').catch((error) => {
            console.warn('Business types API failed:', error.message);
            return fallbackBusinessTypes;
          }),
          api.get('/store-settings').catch((error) => {
            console.warn('Store settings API failed:', error.message);
            return { businessType: defaultBusinessType, storeName: 'My POS Store' };
          })
        ]);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API timeout')), 5000); // Increased timeout
        });

        const [typesResponse, settingsResponse] = await Promise.race([apiCall, timeoutPromise]);

        // Update state with API data if successful
        if (typesResponse && Array.isArray(typesResponse) && typesResponse.length > 0) {
          setBusinessTypes(typesResponse);
        }

        if (settingsResponse && settingsResponse.businessType) {
          setBusinessType(settingsResponse.businessType);
          setStoreSettings(settingsResponse);

          // Cache successful API response
          localStorage.setItem('businessType', JSON.stringify(settingsResponse.businessType));
          localStorage.setItem('storeSettings', JSON.stringify(settingsResponse));
        }

      } catch (apiError) {
        console.warn('API request failed, using cached or fallback data:', apiError.message);

        // Try to use cached data
        const cachedBusinessType = localStorage.getItem('businessType');
        const cachedStoreSettings = localStorage.getItem('storeSettings');

        if (cachedBusinessType && cachedStoreSettings) {
          try {
            const parsedBusinessType = JSON.parse(cachedBusinessType);
            const parsedStoreSettings = JSON.parse(cachedStoreSettings);
            setBusinessType(parsedBusinessType);
            setStoreSettings(parsedStoreSettings);
          } catch (parseError) {
            console.warn('Error parsing cached data, keeping current state');
          }
        }
        // If no cached data, keep the default state we already set
      }

    } catch (err) {
      console.error('Unexpected error in loadBusinessTypeData:', err);
      setError(err.message);
      // Keep the default state we already set
    } finally {
      setLoading(false);
    }
  };

  // Set business type
  const updateBusinessType = async (typeId) => {
    try {
      setLoading(true);

      // Find the selected business type from available types
      const selectedType = businessTypes.find(type => type.id === typeId) || fallbackBusinessTypes.find(type => type.id === typeId);

      if (!selectedType) {
        throw new Error('Business type not found');
      }

      // Try to update via API first
      const response = await api.post('/store-settings/business-type', {
        typeId: typeId
      });

      const updatedSettings = response;
      setStoreSettings(updatedSettings);
      setBusinessType(updatedSettings.businessType);

      // Update localStorage
      localStorage.setItem('businessType', JSON.stringify(updatedSettings.businessType));
      localStorage.setItem('storeSettings', JSON.stringify(updatedSettings));

      return updatedSettings;
    } catch (err) {
      console.error('Error updating business type via API:', err);

      // Fallback: Update locally when API fails
      console.log('Updating business type locally due to API error');
      const selectedType = businessTypes.find(type => type.id === typeId) || fallbackBusinessTypes.find(type => type.id === typeId);

      if (selectedType) {
        setBusinessType(selectedType);
        const updatedSettings = {
          businessType: selectedType,
          storeName: storeSettings?.storeName || 'My POS Store'
        };
        setStoreSettings(updatedSettings);

        // Update localStorage
        localStorage.setItem('businessType', JSON.stringify(selectedType));
        localStorage.setItem('storeSettings', JSON.stringify(updatedSettings));

        return updatedSettings;
      }

      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update store settings
  const updateStoreSettings = async (newSettings) => {
    try {
      setLoading(true);
      const response = await api.put('/store-settings', newSettings);

      const updatedSettings = response;
      setStoreSettings(updatedSettings);

      // Update localStorage
      localStorage.setItem('storeSettings', JSON.stringify(updatedSettings));

      return updatedSettings;
    } catch (err) {
      console.error('Error updating store settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get business type by code
  const getBusinessTypeByCode = (code) => {
    return businessTypes.find(type => type.code === code);
  };

  // Check if current business type matches
  const isBusinessType = (code) => {
    return businessType?.code === code;
  };

  // Get current subtype
  const getCurrentSubtype = () => {
    if (businessType?.code === 'restaurant' && storeSettings?.subtype) {
      return storeSettings.subtype;
    }
    // For restaurant business type, default to 'casual' if no subtype is set
    if (businessType?.code === 'restaurant') {
      return businessType?.defaultSubtype || 'casual';
    }
    return null;
  };

  // Check if current subtype matches
  const isSubtype = (subtypeCode) => {
    return getCurrentSubtype() === subtypeCode;
  };

  // Get subtype configuration
  const getSubtypeConfig = (subtypeCode) => {
    if (businessType?.code === 'restaurant' && businessType.subtypes) {
      return businessType.subtypes[subtypeCode] || null;
    }
    return null;
  };

  // Get current subtype configuration
  const getCurrentSubtypeConfig = () => {
    const currentSubtype = getCurrentSubtype();
    return currentSubtype ? getSubtypeConfig(currentSubtype) : null;
  };

  // Check if feature is enabled for current subtype
  const hasFeature = (featureName) => {
    const subtypeConfig = getCurrentSubtypeConfig();
    return subtypeConfig?.features?.[featureName] || false;
  };

  // Update subtype
  const updateSubtype = async (subtypeCode) => {
    try {
      setLoading(true);

      // Validate subtype exists
      if (businessType?.code !== 'restaurant' || !businessType.subtypes?.[subtypeCode]) {
        throw new Error('Invalid subtype for restaurant business type');
      }

      const updatedSettings = {
        ...storeSettings,
        subtype: subtypeCode,
        subtypeConfig: businessType.subtypes[subtypeCode]
      };

      setStoreSettings(updatedSettings);

      // Update localStorage
      localStorage.setItem('storeSettings', JSON.stringify(updatedSettings));

      console.log(`Business subtype updated to: ${subtypeCode}`);
      return updatedSettings;

    } catch (err) {
      console.error('Error updating business subtype:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBusinessTypeData();

    // Safety timeout to ensure loading never gets stuck
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Business type loading timeout - forcing completion');
        setLoading(false);
      }
    }, 5000); // 5 second safety timeout

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Reload when authentication status changes
  useEffect(() => {
    // Only reload if auth loading is complete and we have authentication
    if (!authLoading && isAuthenticated() && user) {
      console.log('Authentication established, reloading business type data...');
      loadBusinessTypeData();
    }
  }, [user, authLoading]);

  const value = {
    businessType,
    storeSettings,
    businessTypes,
    loading,
    error,
    updateBusinessType,
    updateStoreSettings,
    getBusinessTypeByCode,
    isBusinessType,
    refresh: loadBusinessTypeData,
    // Subtype functions
    getCurrentSubtype,
    isSubtype,
    getSubtypeConfig,
    getCurrentSubtypeConfig,
    hasFeature,
    updateSubtype
  };

  return (
    <BusinessTypeContext.Provider value={value}>
      {children}
    </BusinessTypeContext.Provider>
  );
};
