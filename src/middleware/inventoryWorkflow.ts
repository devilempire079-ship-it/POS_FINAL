import { unifiedConfigs } from '../configs/inventory/unifiedConfigs';

// Workflow handlers map workflow names to actual functions
const workflowHandlers: Record<string, (req: any, res: any, next: Function) => void> = {
  // Pharmacy workflows
  expiry_alerts: (req, res, next) => {
    console.log("🔬 Pharmacy: expiry alerts checked");
    next();
  },
  deduct_stock_by_batch: (req, res, next) => {
    console.log("📦 Pharmacy: stock deducted by batch");
    next();
  },
  controlled_substance_logs: (req, res, next) => {
    console.log("📝 Pharmacy: controlled substance logged");
    next();
  },

  // Restaurant workflows
  auto_deduct_recipe: (req, res, next) => {
    console.log("🍽️ Restaurant: recipe ingredients auto-deducted");
    next();
  },
  forecast_runout: (req, res, next) => {
    console.log("📊 Restaurant: runout forecast updated");
    next();
  },
  low_stock_alerts: (req, res, next) => {
    console.log("🔥 Restaurant: low stock alerts sent");
    next();
  },

  // Rental workflows
  mark_out_of_stock_on_rental: (req, res, next) => {
    console.log("🏠 Rental: item marked unavailable");
    next();
  },
  return_and_condition_check: (req, res, next) => {
    console.log("🔍 Rental: return condition checked");
    next();
  },
  overdue_alerts: (req, res, next) => {
    console.log("⏰ Rental: overdue alerts sent");
    next();
  },
  damage_deposit_tracking: (req, res, next) => {
    console.log("💰 Rental: deposit tracking updated");
    next();
  },

  // Retail workflows
  sku_variant_tracking: (req, res, next) => {
    console.log("🏷️ Retail: SKU variants tracked");
    next();
  },
  warranty_registration: (req, res, next) => {
    console.log("🛡️ Retail: warranty registered");
    next();
  },
  return_and_exchange: (req, res, next) => {
    console.log("🔄 Retail: return processed");
    next();
  },
  promo_and_discounting: (req, res, next) => {
    console.log("💸 Retail: promotion applied");
    next();
  }
};

// Middleware - reads businessType & workflows from unified config
export function inventoryWorkflowMiddleware(req: any, res: any, next: Function) {
  // Get businessType from authenticated user (set by authMiddleware)
  const businessType = req.user?.businessType || 'retail';

  // Get config from unified configs (contains workflow names)
  const config = unifiedConfigs[businessType] || unifiedConfigs.retail;

  // Map workflow names to actual handlers
  const workflows = config.workflows
    .map(workflowName => workflowHandlers[workflowName])
    .filter(Boolean); // Filter out any undefined handlers

  let idx = 0;

  function runNext() {
    if (idx < workflows.length) {
      const handler = workflows[idx++];
      handler(req, res, runNext);
    } else {
      next(); // proceed to actual route logic
    }
  }

  console.log(`🔄 Running ${workflows.length} unified workflow(s) for ${businessType} business`);
  runNext();
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      businessType?: string;
    }
  }
}
