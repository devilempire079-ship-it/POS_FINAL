import { useState, useEffect } from 'react';

// Import config files from index
import { pharmacy, restaurant, rental, retail } from '../configs/inventory';

type BusinessType = 'pharmacy' | 'restaurant' | 'rental' | 'retail' | string;

interface InventoryConfig {
  businessType: string;
  fields: string[];
  workflows: string[];
  theme: string;
  defaultCategories: string[];
}

const CONFIG_MAP: { [key: string]: InventoryConfig } = {
  pharmacy: pharmacy,
  restaurant: restaurant,
  rental: rental,
  retail: retail,
};

// Hook for business-type-aware inventory management
export const useInventoryBusinessType = () => {
  const [businessType, setBusinessType] = useState<BusinessType>('retail');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedBusinessType = localStorage.getItem('businessType') || 'retail';
    setBusinessType(savedBusinessType);
    setLoading(false);
  }, []);

  const config = CONFIG_MAP[businessType] || CONFIG_MAP.retail;

  const loadInventoryConfig = (type: BusinessType): InventoryConfig => {
    return CONFIG_MAP[type] || CONFIG_MAP.retail;
  };

  return {
    businessType,
    config,
    loading,
    loadInventoryConfig
  };
};

// Helper hook for conditional rendering based on inventory features
export const useInventoryConditionalRender = (requiredFields: string[] = []) => {
  const { config, businessType } = useInventoryBusinessType();

  // Check if current business type supports the required fields
  const supportsAllFields = requiredFields.every(field => config.fields.includes(field));

  return {
    shouldRender: supportsAllFields,
    config,
    businessType,
    availableFields: config.fields,
    availableWorkflows: config.workflows
  };
};

export default useInventoryBusinessType;
