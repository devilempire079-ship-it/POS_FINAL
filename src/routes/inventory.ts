import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { inventoryWorkflowMiddleware } from '../middleware/inventoryWorkflow';

const router = express.Router();

// Apply authentication middleware to all inventory routes
router.use(authMiddleware);

// Apply business-type-specific workflow middleware to all inventory routes
// This now uses req.user.businessType from JWT instead of hardcoded values
router.use(inventoryWorkflowMiddleware);

// Inventory routes with automatic workflow enforcement
router.post('/add', (req, res) => {
  // Middleware has already run business-specific workflows
  // Now handle the actual inventory addition
  const businessType = req.user.businessType;

  console.log(`💾 Adding inventory item for ${businessType} business`);

  // Your inventory creation logic here
  res.json({
    message: `Inventory item added successfully for ${businessType} business`,
    data: req.body
  });
});

router.post('/sale', (req, res) => {
  // Middleware enforces business rules (e.g., batch deduction for pharmacy)
  // before allowing the sale to proceed
  const businessType = req.user.businessType;

  console.log(`💰 Processing sale for ${businessType} business`);

  // Your sales processing logic here
  // Middleware has already validated per business rules

  res.json({
    message: `Sale processed successfully for ${businessType} business`,
    data: req.body
  });
});

router.put('/adjust/:productId', (req, res) => {
  // Business-specific stock adjustment rules applied by middleware
  const businessType = req.user.businessType;
  const { productId } = req.params;

  console.log(`🔄 Adjusting inventory for product ${productId} in ${businessType} business`);

  res.json({
    message: `Inventory adjusted successfully for ${businessType} business`,
    productId,
    adjustment: req.body
  });
});

export default router;
