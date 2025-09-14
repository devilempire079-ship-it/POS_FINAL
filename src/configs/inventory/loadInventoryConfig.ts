// Load Inventory Config dynamically based on businessType

import { getUnifiedConfig, type InventoryConfig } from "./unifiedConfigs";

export type BusinessType = "pharmacy" | "restaurant" | "rental" | "retail";

/**
 * Load unified config for given businessType
 * Uses the SINGLE SOURCE OF TRUTH unified configs
 * Defaults to retail if no type is set.
 */
export function loadInventoryConfig(
  businessType: string | null | undefined
): InventoryConfig {
  if (!businessType) return getUnifiedConfig('retail');
  const key = businessType.toLowerCase() as BusinessType;
  return getUnifiedConfig(key);
}
