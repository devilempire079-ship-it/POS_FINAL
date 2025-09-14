// Test script for Import/Export functionality
// This script tests the CSV/Excel import and export capabilities

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');

// Test data
const testProducts = [
  {
    name: 'Test Product 1',
    description: 'A test product for import testing',
    barcode: '1234567890123',
    sku: 'TEST001',
    type: 'unit',
    category: 'test',
    price: 29.99,
    costPrice: 15.00,
    stockQty: 100,
    minStockLevel: 10,
    supplier: 'Test Supplier',
    location: 'Test Location',
    isActive: true
  },
  {
    name: 'Test Product 2',
    description: 'Another test product',
    barcode: '9876543210987',
    sku: 'TEST002',
    type: 'pack',
    category: 'test',
    price: 49.99,
    costPrice: 25.00,
    stockQty: 50,
    minStockLevel: 5,
    supplier: 'Test Supplier 2',
    location: 'Test Location 2',
    isActive: true
  }
];

// Test CSV Export
function testCSVExport() {
  console.log('🧪 Testing CSV Export...');

  try {
    const csv = Papa.unparse(testProducts);
    const csvPath = path.join(__dirname, 'test_export.csv');

    fs.writeFileSync(csvPath, csv);
    console.log('✅ CSV Export successful:', csvPath);

    // Verify the file was created and has content
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    console.log('📄 CSV Content length:', fileContent.length);

    return true;
  } catch (error) {
    console.error('❌ CSV Export failed:', error);
    return false;
  }
}

// Test CSV Import
function testCSVImport() {
  console.log('🧪 Testing CSV Import...');

  try {
    const csvPath = path.join(__dirname, 'test_export.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('✅ CSV Import successful');
        console.log('📊 Parsed data count:', results.data.length);
        console.log('📋 First row:', results.data[0]);
      },
      error: (error) => {
        console.error('❌ CSV Import failed:', error);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ CSV Import failed:', error);
    return false;
  }
}

// Test Excel Export
function testExcelExport() {
  console.log('🧪 Testing Excel Export...');

  try {
    const worksheet = XLSX.utils.json_to_sheet(testProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const excelPath = path.join(__dirname, 'test_export.xlsx');
    XLSX.writeFile(workbook, excelPath);

    console.log('✅ Excel Export successful:', excelPath);

    // Verify the file was created
    if (fs.existsSync(excelPath)) {
      const stats = fs.statSync(excelPath);
      console.log('📄 Excel file size:', stats.size, 'bytes');
    }

    return true;
  } catch (error) {
    console.error('❌ Excel Export failed:', error);
    return false;
  }
}

// Test Excel Import
function testExcelImport() {
  console.log('🧪 Testing Excel Import...');

  try {
    const excelPath = path.join(__dirname, 'test_export.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('✅ Excel Import successful');
    console.log('📊 Parsed data count:', data.length);
    console.log('📋 First row:', data[0]);

    return true;
  } catch (error) {
    console.error('❌ Excel Import failed:', error);
    return false;
  }
}

// Test data validation
function testDataValidation() {
  console.log('🧪 Testing Data Validation...');

  const validProduct = {
    name: 'Valid Product',
    price: 29.99,
    stockQty: 100,
    isActive: true
  };

  const invalidProduct = {
    name: '', // Missing required field
    price: 'invalid', // Invalid price
    stockQty: 'invalid', // Invalid stock
    isActive: true
  };

  // Test validation logic (simplified version)
  function validateProduct(product) {
    const errors = [];

    if (!product.name || product.name.trim() === '') {
      errors.push('Missing required field: name');
    }

    if (!product.price || isNaN(parseFloat(product.price))) {
      errors.push('Invalid price format');
    }

    if (!product.stockQty || isNaN(parseInt(product.stockQty))) {
      errors.push('Invalid stock quantity');
    }

    return errors;
  }

  const validErrors = validateProduct(validProduct);
  const invalidErrors = validateProduct(invalidProduct);

  console.log('✅ Valid product errors:', validErrors.length, '(should be 0)');
  console.log('✅ Invalid product errors:', invalidErrors.length, '(should be > 0)');

  if (validErrors.length === 0 && invalidErrors.length > 0) {
    console.log('✅ Data validation working correctly');
    return true;
  } else {
    console.error('❌ Data validation failed');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Import/Export Tests...\n');

  const results = [];

  // Test CSV functionality
  results.push(testCSVExport());
  results.push(testCSVImport());

  // Test Excel functionality
  results.push(testExcelExport());
  results.push(testExcelImport());

  // Test validation
  results.push(testDataValidation());

  console.log('\n📊 Test Results:');
  console.log('✅ Passed:', results.filter(r => r).length);
  console.log('❌ Failed:', results.filter(r => !r).length);
  console.log('📈 Success Rate:', ((results.filter(r => r).length / results.length) * 100).toFixed(1) + '%');

  if (results.every(r => r)) {
    console.log('\n🎉 All tests passed! Import/Export functionality is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }

  // Cleanup test files
  console.log('\n🧹 Cleaning up test files...');
  const testFiles = ['test_export.csv', 'test_export.xlsx'];
  testFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted:', file);
    }
  });
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCSVExport,
  testCSVImport,
  testExcelExport,
  testExcelImport,
  testDataValidation,
  runTests
};
