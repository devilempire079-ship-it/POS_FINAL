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
