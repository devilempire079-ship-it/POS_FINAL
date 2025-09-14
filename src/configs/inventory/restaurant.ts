// Restaurant Inventory Config
// Defines fields, workflows, and UI theming for restaurant businesses

export const restaurantInventoryConfig = {
  businessType: "restaurant",

  // Extra fields to render in the inventory form
  fields: [
    "Ingredient Type",
    "Recipe Mapping",       // link ingredients to menu items
    "Storage Temperature",  // fridge, freezer, pantry
    "Supplier Notes"        // preferred supplier or brand
  ],

  // Workflows specific to restaurant inventory
  workflows: [
    "auto_deduct_recipe",   // when a menu item sells, deduct ingredients
    "forecast_runout",      // predict ingredient shortage based on sales
    "low_stock_alerts"      // notify manager when critical items drop
  ],

  // Theming (Tailwind classes for look/feel)
  theme: "bg-orange-50 text-orange-800 border-l-4 border-orange-500",

  // Default categories used in restaurant inventory
  defaultCategories: [
    "Ingredients",
    "Beverages",
    "Prepared Foods",
    "Condiments",
    "Supplies"
  ]
};

// Backwards compatibility exports
export const config = restaurantInventoryConfig;
export type RestaurantInventoryFields = typeof config.fields[number];
export type RestaurantWorkflows = typeof config.workflows[number];
