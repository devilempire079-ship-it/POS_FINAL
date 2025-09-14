// Workflow registry maps each businessType to backend workflows

type WorkflowHandler = (req: any, res: any, next: Function | ((error?: any) => void)) => void;

export const workflowRegistry: Record<string, WorkflowHandler[]> = {
  pharmacy: [
    (req, res, next) => {
      console.log("🔬 Pharmacy: expiry check");
      next();
    },
    (req, res, next) => {
      console.log("📦 Pharmacy: deduct stock by batch");
      next();
    },
    (req, res, next) => {
      console.log("📝 Pharmacy: controlled substance log");
      next();
    },
  ],

  restaurant: [
    (req, res, next) => {
      console.log("🍽️ Restaurant: recipe deduction");
      next();
    },
    (req, res, next) => {
      console.log("📊 Restaurant: forecast runout");
      next();
    },
    (req, res, next) => {
      console.log("🔥 Restaurant: low stock alerts");
      next();
    },
  ],

  rental: [
    (req, res, next) => {
      console.log("🏠 Rental: mark asset unavailable");
      next();
    },
    (req, res, next) => {
      console.log("⏰ Rental: overdue alert");
      next();
    },
    (req, res, next) => {
      console.log("💰 Rental: deposit tracking");
      next();
    },
    (req, res, next) => {
      console.log("🔍 Rental: condition check on return");
      next();
    },
  ],

  retail: [
    (req, res, next) => {
      console.log("🏷️ Retail: SKU variant tracking");
      next();
    },
    (req, res, next) => {
      console.log("🛡️ Retail: warranty registration");
      next();
    },
    (req, res, next) => {
      console.log("🔄 Retail: return & exchange handling");
      next();
    },
    (req, res, next) => {
      console.log("💸 Retail: promo & discounting");
      next();
    },
  ],
};
