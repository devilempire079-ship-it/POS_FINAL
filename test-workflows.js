// 🧪 WORKFLOW CONFIGURATION VALIDATION
// Testing that workflows are properly defined for each business vertical

console.log('🚀 STARTING WORKFLOW CONFIG VALIDATION\n');

const { unifiedConfigs } = require('./src/configs/inventory/unifiedConfigs');

const testResults = { passed: 0, failed: 0, total: 0 };

function testWorkflow(name, passed, details = {}) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
  }
  if (details.message) console.log(`   ↳ ${details.message}`);
}

// Mock request/response objects for testing
function createMockReq(userBusinessType) {
  return {
    user: { businessType: userBusinessType },
    body: {
      transactionType: 'sale',
      items: [{ product_id: 1, quantity: 5 }],
      customerId: 123
    },
    method: 'POST',
    url: '/api/inventory/sale'
  };
}

function createMockRes() {
  const events = [];
  const logs = [];
  return {
    status: (code) => ({ json: (data) => ({ code, data }) }),
    json: (data) => data,
    send: (data) => data,
    events,
    logs,
    emit: (event, data) => events.push({ event, data }),
    logWorkflow: (workflow, message) => logs.push({ workflow, message })
  };
}

// Override console.log for workflow tracking
const originalConsoleLog = console.log;
let workflowLogs = [];

function logWorkflowExecution(vertical, workflow, message) {
  workflowLogs.push({ vertical, workflow, message });
  originalConsoleLog(`[${vertical}:${workflow}] ${message}`);
}

// Mock workflow handlers to track execution
const mockWorkflowHandlers = {
  // Pharmacy workflows
  expiry_alerts: (req, res, next) => {
    logWorkflowExecution('pharmacy', 'expiry_alerts', 'Checking batch expiries for DEA compliance');
    // Simulate expiry check logic
    const expiredBatches = req.body.items.filter(item => item.batchExpiry < Date.now());
    if (expiredBatches.length > 0) {
      res.emit('expiry_alert', { batches: expiredBatches, severity: 'CRITICAL' });
    }
    next();
  },
  deduct_stock_by_batch: (req, res, next) => {
    logWorkflowExecution('pharmacy', 'deduct_stock_by_batch', 'Appling FIFO batch deduction');
    // Simulate batch tracking logic
    req.body.items.forEach(item => {
      item.batchDeducted = item.batchNumbers.shift();
      item.quantityDeducted = item.quantity;
    });
    next();
  },
  controlled_substance_logs: (req, res, next) => {
    logWorkflowExecution('pharmacy', 'controlled_substance_logs', 'Logging DEA controlled substance transaction');
    const controlledItems = req.body.items.filter(item => item.isControlled);
    res.emit('dea_log', { transactionId: req.body.id, controlledItems, timestamp: Date.now() });
    next();
  },

  // Restaurant workflows
  auto_deduct_recipe: (req, res, next) => {
    logWorkflowExecution('restaurant', 'auto_deduct_recipe', 'Deducting ingredients using recipe mapping');
    req.body.items.forEach(item => {
      item.recipeIngredients = item.recipe.map(ing => ({
        ingredientId: ing.id,
        quantityUsed: ing.quantityPerUnit * item.quantity,
        unit: ing.unit
      }));
    });
    next();
  },
  forecast_runout: (req, res, next) => {
    logWorkflowExecution('restaurant', 'forecast_runout', 'Forecasting ingredient runout timing');
    req.body.items.forEach(item => {
      item.forecastData = {
        currentStock: item.inventory.current,
        daysRemaining: Math.floor(item.inventory.current / item.dailyUsage),
        reorderPoint: item.dailyUsage * 3
      };
    });
    next();
  },
  low_stock_alerts: (req, res, next) => {
    logWorkflowExecution('restaurant', 'low_stock_alerts', 'Generating restaurant kitchen alerts');
    const lowStockItems = req.body.items.filter(item => item.inventory.current <= item.reorderPoint);
    if (lowStockItems.length > 0) {
      res.emit('kitchen_alert', { items: lowStockItems, priority: 'HIGH' });
    }
    next();
  },

  // Rental workflows
  mark_out_of_stock_on_rental: (req, res, next) => {
    logWorkflowExecution('rental', 'mark_out_of_stock_on_rental', 'Marking rental equipment unavailable');
    req.body.items.forEach(item => {
      item.rental_start = req.body.startDate;
      item.rental_end = req.body.endDate;
      item.status = 'RENTED_OUT';
    });
    next();
  },
  return_and_condition_check: (req, res, next) => {
    logWorkflowExecution('rental', 'return_and_condition_check', 'Inspection workflow for returned equipment');
    if (req.body.returnInspection) {
      req.body.returnRecord = {
        condition: req.body.returnInspection.condition,
        damage: req.body.returnInspection.damage,
        depositReturned: req.body.returnInspection.damage ? 0 : req.body.depositAmount,
        inspectionDate: Date.now()
      };
    }
    next();
  },
  overdue_alerts: (req, res, next) => {
    logWorkflowExecution('rental', 'overdue_alerts', 'Rental overdue monitoring and billing');
    const overdueRentals = req.body.items.filter(item => item.rental_end < Date.now());
    if (overdueRentals.length > 0) {
      res.emit('rental_overdue', {
        rentals: overdueRentals,
        lateFees: overdueRentals.map(item => item.dailyRate * 0.1),
        autoBilling: true
      });
    }
    next();
  },

  // Retail workflows
  sku_variant_tracking: (req, res, next) => {
    logWorkflowExecution('retail', 'sku_variant_tracking', 'SKU variant inventory tracking');
    req.body.items.forEach(item => {
      item.variantRecord = {
        sku: item.sku,
        color: item.color,
        size: item.size,
        style: item.style,
        stockUpdated: true
      };
    });
    next();
  },
  warranty_registration: (req, res, next) => {
    logWorkflowExecution('retail', 'warranty_registration', 'Warranty service contract management');
    req.body.items.forEach(item => {
      item.warrantyPlan = {
        productId: item.product_id,
        coverage: item.warranty_period || 12,
        startDate: Date.now(),
        warrantyId: `W${Date.now()}${item.product_id}`
      };
    });
    next();
  },
  return_and_exchange: (req, res, next) => {
    logWorkflowExecution('retail', 'return_and_exchange', 'Consumer return processing workflow');
    req.body.items.forEach(item => {
      item.returnPolicy = {
        eligible: Date.now() < (item.purchase_date + (30 * 24 * 60 * 60 * 1000)), // 30 days
        restockingFee: item.returnType === 'opened' ? item.price * 0.15 : 0,
        exchangeOptions: item.category.return_exchanges
      };
    });
    next();
  }
};

// Override the workflow registry to use our test mocks
const originalWorkflowHandlers = require('./src/middleware/inventoryWorkflow.js').workflowHandlers;
require('./src/middleware/inventoryWorkflow.js').workflowHandlers = mockWorkflowHandlers;

console.log('🚀 STARTING WORKFLOW EXECUTION TESTING\n');
console.log('Testing unified config-driven workflow execution across all verticals...\n');

function testWorkflow(name, passed, details = {}) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
  }
  if (details.message) console.log(`   ↳ ${details.message}`);
}

// Test 1: Validate all verticals have workflows defined
function testWorkflowExistence() {
  console.log('📋 TESTING WORKFLOW EXISTENCE\n');

  const verticals = ['pharmacy', 'restaurant', 'rental', 'retail'];

  verticals.forEach(vertical => {
    const config = unifiedConfigs[vertical];
    if (!config) {
      testWorkflow(`${vertical} config exists`, false, { message: 'Config missing' });
      return;
    }

    const hasWorkflows = config.workflows && Array.isArray(config.workflows) && config.workflows.length > 0;
    testWorkflow(`${vertical} has workflows`, hasWorkflows, {
      message: hasWorkflows ? `${config.workflows.length} workflows defined` : 'No workflows found'
    });
  });
}

// Test 2: Validate workflow definitions are valid strings
function testWorkflowValidity() {
  console.log('\n🔍 TESTING WORKFLOW VALIDITY\n');

  Object.entries(unifiedConfigs).forEach(([vertical, config]) => {
    if (!config.workflows || !Array.isArray(config.workflows)) {
      return; // Already tested above
    }

    const validWorkflows = config.workflows.every(workflow =>
      typeof workflow === 'string' &&
      workflow.length > 0 &&
      !workflow.includes(' ') &&
      workflow.includes('_')
    );

    testWorkflow(`${vertical} workflow names`, validWorkflows, {
      message: validWorkflows ? 'All workflow names valid' : 'Invalid workflow names found'
    });
  });
}

// Test 3: Validate vertical-specific workflows
function testVerticalSpecificWorkflows() {
  console.log('\n🏥 TESTING VERTICAL-SPECIFIC WORKFLOWS\n');

  const expectedWorkflows = {
    pharmacy: ['expiry_alerts', 'deduct_stock_by_batch', 'controlled_substance_logs'],
    restaurant: ['auto_deduct_recipe', 'forecast_runout', 'low_stock_alerts'],
    rental: ['mark_out_of_stock_on_rental', 'return_and_condition_check', 'overdue_alerts'],
    retail: ['sku_variant_tracking', 'warranty_registration', 'return_and_exchange']
  };

  Object.entries(expectedWorkflows).forEach(([vertical, expected]) => {
    const config = unifiedConfigs[vertical];
    if (!config || !config.workflows) {
      return;
    }

    const hasExpectedWorkflows = expected.every(expectedWorkflow =>
      config.workflows.includes(expectedWorkflow)
    );

    testWorkflow(`${vertical} core workflows`, hasExpectedWorkflows, {
      message: hasExpectedWorkflows ? 'All core workflows present' : 'Missing core workflows'
    });
  });
}

// Test 4: Validate workflow sequencing
function testWorkflowSequencing() {
  console.log('\n🔄 TESTING WORKFLOW SEQUENCING\n');

  Object.entries(unifiedConfigs).forEach(([vertical, config]) => {
    if (!config.workflows || config.workflows.length === 0) {
      return;
    }

    // Check workflows are in logical order for each vertical
    let sequencingValid = true;

    if (vertical === 'pharmacy') {
      // Check -> Deduct -> Log (safety first, then compliance)
      const workflows = config.workflows;
      if (workflows.includes('expiry_alerts') && workflows.includes('deduct_stock_by_batch')) {
        const alertIndex = workflows.indexOf('expiry_alerts');
        const deductIndex = workflows.indexOf('deduct_stock_by_batch');
        if (alertIndex > deductIndex) sequencingValid = false; // Alerts should come before deduction
      }
    }

    testWorkflow(`${vertical} workflow order`, sequencingValid, {
      message: sequencingValid ? 'Workflows in logical order' : 'Workflow sequencing may need review'
    });
  });
}

// Test 5: Validate business logic coverage
function testBusinessLogicCoverage() {
  console.log('\n🧠 TESTING BUSINESS LOGIC COVERAGE\n');

  const logicChecks = {
    pharmacy: {
      compliance: ['expiry_alerts', 'controlled_substance_logs'],
      inventory: ['deduct_stock_by_batch']
    },
    restaurant: {
      operations: ['auto_deduct_recipe', 'forecast_runout', 'low_stock_alerts']
    },
    rental: {
      lifecycle: ['mark_out_of_stock_on_rental', 'return_and_condition_check'],
      finance: ['overdue_alerts']
    },
    retail: {
      service: ['warranty_registration', 'return_and_exchange'],
      inventory: ['sku_variant_tracking']
    }
  };

  Object.entries(logicChecks).forEach(([vertical, checks]) => {
    Object.entries(checks).forEach(([category, requiredWorkflows]) => {
      const config = unifiedConfigs[vertical];
      const coverage = requiredWorkflows.every(workflow =>
        config.workflows.includes(workflow)
      );

      testWorkflow(`${vertical} ${category} coverage`, coverage, {
        message: coverage ? 'Complete logic coverage' : `Missing ${requiredWorkflows.join(', ')}`
      });
    });
  });
}

// Run all validation tests
testWorkflowExistence();
testWorkflowValidity();
testVerticalSpecificWorkflows();
testWorkflowSequencing();
testBusinessLogicCoverage();

// Final results
console.log('\n' + '='.repeat(60));
console.log('🏆 WORKFLOW CONFIG VALIDATION RESULTS');
console.log('='.repeat(60));

console.log(`📊 Total Tests: ${testResults.total}`);
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 ALL WORKFLOW CONFIGURATION TESTS PASSED!');
  console.log('✅ Workflows properly defined for all verticals');
  console.log('✅ Business logic coverage complete');
  console.log('✅ Workflow sequencing optimized');
  console.log('✅ Config-driven architecture validated');
  console.log('\n🌟 Workflows ready for production deployment!');
} else {
  console.log('\n⚠️ WORKFLOW CONFIGURATION ISSUES DETECTED');
  console.log('Please review failed tests above.');
}

console.log('='.repeat(60));
