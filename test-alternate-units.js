// Test file for alternate units functionality
// This tests the new feature allowing customers to buy products in different units

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAlternateUnits() {
  console.log('🧪 Testing Alternate Units Functionality');
  console.log('=' .repeat(50));

  try {
    // Test 1: Create a product with alternate units (rope example)
    console.log('\n📦 Test 1: Creating product with alternate units (Rope)');

    const ropeProduct = await prisma.product.create({
      data: {
        name: 'Nylon Rope',
        description: 'High-strength nylon rope for various applications',
        type: 'unit',
        cost: 2.50,
        price: 3.99,
        stockQty: 100,
        unitOfMeasure: 'm', // Primary unit: meters
        alternateUnit: 'ft', // Alternate unit: feet
        alternateUnitConversionRate: 3.28084, // 1 meter = 3.28084 feet
        minOrderQty: 1.0,
        conversionRate: 1.0,
        sku: 'ROPE-NYLON-001',
        isActive: true
      }
    });

    console.log('✅ Created rope product:', {
      id: ropeProduct.id,
      name: ropeProduct.name,
      primaryUnit: ropeProduct.unitOfMeasure,
      alternateUnit: ropeProduct.alternateUnit,
      conversionRate: ropeProduct.alternateUnitConversionRate
    });

    // Test 2: Create a product with different alternate units (fabric)
    console.log('\n🧵 Test 2: Creating product with alternate units (Fabric)');

    const fabricProduct = await prisma.product.create({
      data: {
        name: 'Cotton Fabric',
        description: 'Premium cotton fabric for sewing projects',
        type: 'unit',
        cost: 8.00,
        price: 15.99,
        stockQty: 50,
        unitOfMeasure: 'm', // Primary unit: meters
        alternateUnit: 'yd', // Alternate unit: yards
        alternateUnitConversionRate: 1.09361, // 1 meter = 1.09361 yards
        minOrderQty: 0.5,
        conversionRate: 1.0,
        sku: 'FABRIC-COTTON-001',
        isActive: true
      }
    });

    console.log('✅ Created fabric product:', {
      id: fabricProduct.id,
      name: fabricProduct.name,
      primaryUnit: fabricProduct.unitOfMeasure,
      alternateUnit: fabricProduct.alternateUnit,
      conversionRate: fabricProduct.alternateUnitConversionRate
    });

    // Test 3: Create a product with no alternate units
    console.log('\n📏 Test 3: Creating product with no alternate units');

    const tapeProduct = await prisma.product.create({
      data: {
        name: 'Measuring Tape',
        description: 'Professional measuring tape',
        type: 'unit',
        cost: 5.00,
        price: 12.99,
        stockQty: 25,
        unitOfMeasure: 'each', // Primary unit: each
        alternateUnit: null, // No alternate unit
        alternateUnitConversionRate: 1.0,
        minOrderQty: 1.0,
        conversionRate: 1.0,
        sku: 'TAPE-MEASURE-001',
        isActive: true
      }
    });

    console.log('✅ Created tape product:', {
      id: tapeProduct.id,
      name: tapeProduct.name,
      primaryUnit: tapeProduct.unitOfMeasure,
      alternateUnit: tapeProduct.alternateUnit,
      conversionRate: tapeProduct.alternateUnitConversionRate
    });

    // Test 4: Query all products with alternate units
    console.log('\n🔍 Test 4: Querying products with alternate units');

    const productsWithAlternateUnits = await prisma.product.findMany({
      where: {
        alternateUnit: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        unitOfMeasure: true,
        alternateUnit: true,
        alternateUnitConversionRate: true,
        price: true
      }
    });

    console.log('✅ Products with alternate units:');
    productsWithAlternateUnits.forEach(product => {
      console.log(`  - ${product.name}: ${product.unitOfMeasure} ↔ ${product.alternateUnit} (1:${product.alternateUnitConversionRate})`);
    });

    // Test 5: Simulate pricing calculations
    console.log('\n💰 Test 5: Pricing calculations');

    // Rope pricing scenarios
    const ropeScenarios = [
      { unit: 'primary', quantity: 1, description: '1 meter of rope' },
      { unit: 'alternate', quantity: 1, description: '1 foot of rope' },
      { unit: 'alternate', quantity: 3, description: '3 feet of rope' },
      { unit: 'primary', quantity: 5, description: '5 meters of rope' }
    ];

    ropeScenarios.forEach(scenario => {
      let totalUnits, totalPrice;

      if (scenario.unit === 'primary') {
        totalUnits = scenario.quantity;
        totalPrice = scenario.quantity * ropeProduct.price;
      } else {
        totalUnits = scenario.quantity / ropeProduct.alternateUnitConversionRate;
        totalPrice = totalUnits * ropeProduct.price;
      }

      console.log(`  ${scenario.description}:`);
      console.log(`    Total units: ${totalUnits.toFixed(4)} ${ropeProduct.unitOfMeasure}`);
      console.log(`    Total price: $${totalPrice.toFixed(2)}`);
    });

    // Test 6: Update alternate unit settings
    console.log('\n🔄 Test 6: Updating alternate unit settings');

    const updatedRope = await prisma.product.update({
      where: { id: ropeProduct.id },
      data: {
        alternateUnit: 'in', // Change from feet to inches
        alternateUnitConversionRate: 39.3701 // 1 meter = 39.3701 inches
      }
    });

    console.log('✅ Updated rope alternate unit:', {
      name: updatedRope.name,
      oldAlternate: 'ft',
      newAlternate: updatedRope.alternateUnit,
      newRate: updatedRope.alternateUnitConversionRate
    });

    // Test 7: Remove alternate unit
    console.log('\n❌ Test 7: Removing alternate unit');

    const fabricWithoutAlternate = await prisma.product.update({
      where: { id: fabricProduct.id },
      data: {
        alternateUnit: null,
        alternateUnitConversionRate: 1.0
      }
    });

    console.log('✅ Removed alternate unit from fabric:', {
      name: fabricWithoutAlternate.name,
      alternateUnit: fabricWithoutAlternate.alternateUnit
    });

    // Test 8: Verify data integrity
    console.log('\n🔒 Test 8: Data integrity check');

    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        unitOfMeasure: true,
        alternateUnit: true,
        alternateUnitConversionRate: true
      }
    });

    console.log('✅ All products data integrity:');
    allProducts.forEach(product => {
      const hasAlternate = product.alternateUnit !== null;
      const hasValidRate = product.alternateUnitConversionRate > 0;

      if (hasAlternate && !hasValidRate) {
        console.log(`  ❌ ${product.name}: Has alternate unit but invalid conversion rate`);
      } else if (!hasAlternate && product.alternateUnitConversionRate !== 1.0) {
        console.log(`  ⚠️  ${product.name}: No alternate unit but non-default conversion rate`);
      } else {
        console.log(`  ✅ ${product.name}: Data integrity OK`);
      }
    });

    console.log('\n🎉 All alternate units tests completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAlternateUnits();
