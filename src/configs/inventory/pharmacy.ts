// Pharmacy Inventory Config
// This config tells the UI and workflows what to load
// for a pharmacy-type business

export const pharmacyInventoryConfig = {
  businessType: "pharmacy",

  // Extra fields to render in the inventory form
  fields: [
    "Batch No",
    "Expiry Date",
    "Manufacturer",
    "Prescription Required",
    "Controlled Substance Flag"
  ],

  // Which workflows should run for this business type
  workflows: [
    "expiry_alerts",              // warn if product near expiry
    "controlled_substance_logs",  // extra audit logging
    "deduct_stock_by_batch"       // FEFO (first-expiry-first-out) handling
  ],

  // Theming (Tailwind classes for look/feel)
  theme: "bg-green-50 text-green-800 border-l-4 border-green-500",

  // Default categories used in pharmacy inventory
  defaultCategories: [
    "Prescription Drugs",
    "OTC Medicines",
    "Supplements",
    "Medical Devices",
    "Personal Care"
  ]
};

// Backwards compatibility exports
export const config = pharmacyInventoryConfig;
export type PharmacyInventoryFields = typeof config.fields[number];
export type PharmacyWorkflows = typeof config.workflows[number];
