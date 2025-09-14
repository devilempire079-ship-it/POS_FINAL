// Index file for inventory configurations
// SINGLE SOURCE OF TRUTH - all business type configurations in one place

// UNIFIED CONFIGS - the new approach (recommended)
export {
  unifiedConfigs,
  getUnifiedConfig,
  type InventoryConfig
} from './unifiedConfigs';

// Legacy individual configs (deprecated - migrate to unified configs)
export { pharmacyInventoryConfig as pharmacy } from './pharmacy';
export { restaurantInventoryConfig as restaurant } from './restaurant';
export { rentalInventoryConfig as rental } from './rental';
export { retailInventoryConfig as retail } from './retail';

// Workflow registry (still used internally by unified configs)
export { workflowRegistry } from './workflowRegistry';

// Config loader - now uses unified configs under the hood
export { loadInventoryConfig, type BusinessType } from './loadInventoryConfig';
