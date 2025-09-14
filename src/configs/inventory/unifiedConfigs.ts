// Unified inventory configs: shared by frontend (UI) & backend (workflows)
// SINGLE SOURCE OF TRUTH for all business-type configurations
// PERFECT SEPARATION OF CONCERNS: UI vs Workflows

export interface InventoryConfig {
  businessType: "pharmacy" | "restaurant" | "rental" | "retail";
  ui: {
    fields: string[];      // Form fields to render (FRONTEND ONLY)
    theme: string;         // Tailwind theme classes (FRONTEND ONLY)
    defaultCategories: string[]; // Category suggestions (FRONTEND ONLY)
  };
  workflows: string[];     // Workflow keys for backend execution (BACKEND ONLY)
}

// Master configs with perfect separation
export const unifiedConfigs: Record<string, InventoryConfig> = {
  pharmacy: {
    businessType: "pharmacy",
    ui: {
      fields: ["Batch No", "Expiry Date", "Manufacturer", "Prescription Required", "Controlled Substance Flag"],
      theme: "bg-green-50 text-green-800 border-l-4 border-green-500",
      defaultCategories: ["Prescription Drugs", "OTC Medicines", "Supplements", "Medical Devices", "Personal Care"]
    },
    workflows: ["expiry_alerts", "deduct_stock_by_batch", "controlled_substance_logs"]
  },

  restaurant: {
    businessType: "restaurant",
    ui: {
      fields: ["Ingredient Type", "Recipe Mapping", "Storage Temperature", "Supplier Notes"],
      theme: "bg-orange-50 text-orange-800 border-l-4 border-orange-500",
      defaultCategories: ["Ingredients", "Beverages", "Prepared Foods", "Condiments", "Supplies"]
    },
    workflows: ["auto_deduct_recipe", "forecast_runout", "low_stock_alerts"]
  },

  rental: {
    businessType: "rental",
    ui: {
      fields: ["Asset Condition", "Rental Rate", "Contract ID", "Deposit Amount", "Maintenance Schedule"],
      theme: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
      defaultCategories: ["Vehicles", "Equipment", "Real Estate", "Electronics", "Tools"]
    },
    workflows: ["mark_out_of_stock_on_rental", "return_and_condition_check", "overdue_alerts", "damage_deposit_tracking"]
  },

  retail: {
    businessType: "retail",
    ui: {
      fields: ["Variant Options", "Barcode/UPC", "Warranty Period", "Discount Eligibility", "Bundle Pack"],
      theme: "bg-gray-50 text-gray-800 border-l-4 border-gray-500",
      defaultCategories: ["Apparel", "Electronics", "Home Goods", "Beauty & Personal Care", "Seasonal Items"]
    },
    workflows: ["sku_variant_tracking", "warranty_registration", "return_and_exchange", "promo_and_discounting"]
  }
};

// Helper function to get config with fallback
export function getUnifiedConfig(businessType: string): InventoryConfig {
  return unifiedConfigs[businessType] || unifiedConfigs.retail;
}
