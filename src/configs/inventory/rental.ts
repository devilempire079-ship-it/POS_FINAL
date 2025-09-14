// Rental Inventory Config
// Defines fields, workflows, and UI theming for rental businesses

export const rentalInventoryConfig = {
  businessType: "rental",

  // Extra fields to render in the inventory form
  fields: [
    "Asset Condition",
    "Rental Rate",
    "Contract ID",
    "Deposit Amount",
    "Maintenance Schedule"
  ],

  // Workflows specific to rental inventory
  workflows: [
    "mark_out_of_stock_on_rental", // when asset is rented, mark unavailable
    "return_and_condition_check",  // upon return, update condition + stock
    "overdue_alerts",              // notify if rental exceeds end date
    "damage_deposit_tracking"      // manage deposits & claims
  ],

  // Theming (Tailwind classes for look/feel)
  theme: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",

  // Default categories used in rental inventory
  defaultCategories: [
    "Vehicles",
    "Equipment",
    "Real Estate",
    "Electronics",
    "Tools"
  ]
};

// Backwards compatibility exports
export const config = rentalInventoryConfig;
export type RentalInventoryFields = typeof config.fields[number];
export type RentalWorkflows = typeof config.workflows[number];
