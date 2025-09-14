// Retail Inventory Config
// Defines fields, workflows, and UI theming for retail businesses

export const retailInventoryConfig = {
  businessType: "retail",

  // Extra fields to render in the inventory form
  fields: [
    "Variant Options",   // size, color, brand
    "Barcode/UPC",
    "Warranty Period",
    "Discount Eligibility",
    "Bundle Pack"
  ],

  // Workflows specific to retail inventory
  workflows: [
    "sku_variant_tracking",  // track stock by size/color/brand
    "warranty_registration", // link purchases to warranty service
    "return_and_exchange",   // manage returns with stock adjustments
    "promo_and_discounting"  // seasonal/loyalty discounts
  ],

  // Theming (Tailwind classes for look/feel)
  theme: "bg-gray-50 text-gray-800 border-l-4 border-gray-500",

  // Default categories used in retail inventory
  defaultCategories: [
    "Apparel",
    "Electronics",
    "Home Goods",
    "Beauty & Personal Care",
    "Seasonal Items"
  ]
};

// Backwards compatibility exports
export const config = retailInventoryConfig;
export type RetailInventoryFields = typeof config.fields[number];
export type RetailWorkflows = typeof config.workflows[number];
