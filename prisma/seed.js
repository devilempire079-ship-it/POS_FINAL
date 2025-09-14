const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  try {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@essen.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@essen.com',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      isActive: true
    }
  });

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@essen.com' },
    update: {},
    create: {
      name: 'Store Manager',
      email: 'manager@essen.com',
      password: await bcrypt.hash('Manager123!', 10),
      role: 'manager',
      isActive: true
    }
  });

  // Create cashier users
  const cashier1User = await prisma.user.upsert({
    where: { email: 'cashier1@essen.com' },
    update: {},
    create: {
      name: 'John Cashier',
      email: 'cashier1@essen.com',
      password: await bcrypt.hash('Cashier123!', 10),
      role: 'cashier',
      isActive: true
    }
  });

  const cashier2User = await prisma.user.upsert({
    where: { email: 'cashier2@essen.com' },
    update: {},
    create: {
      name: 'Jane Cashier',
      email: 'cashier2@essen.com',
      password: await bcrypt.hash('Cashier123!', 10),
      role: 'cashier',
      isActive: true
    }
  });

  console.log('👤 Created users:', {
    admin: adminUser.name,
    manager: managerUser.name,
    cashiers: [cashier1User.name, cashier2User.name]
  });

  // Create Business Types
  const businessTypesData = [
    {
      code: 'retail',
      name: 'Retail Store',
      description: 'General retail products and merchandise',
      icon: '🛍️',
      sortOrder: 1,
      isActive: true
    },
    {
      code: 'repair',
      name: 'Repair/Service',
      description: 'Service and repair business with parts inventory',
      icon: '🔧',
      sortOrder: 2,
      isActive: true
    },
    {
      code: 'pharmacy',
      name: 'Pharmacy',
      description: 'Medical and pharmaceutical products',
      icon: '💊',
      sortOrder: 3,
      isActive: true
    },
    {
      code: 'restaurant',
      name: 'Restaurant',
      description: 'Food and beverage service establishment',
      icon: '🍽️',
      sortOrder: 4,
      isActive: true
    },
    {
      code: 'rental',
      name: 'Equipment Rental',
      description: 'Equipment and tool rental business',
      icon: '🏗️',
      sortOrder: 5,
      isActive: true
    }
  ];

  for (const businessTypeData of businessTypesData) {
    const businessType = await prisma.businessType.upsert({
      where: { code: businessTypeData.code },
      update: businessTypeData,
      create: businessTypeData
    });
    console.log('🏪 Created business type:', businessType.name);

    // Create default settings for each business type
    const defaultSettings = [
      { key: 'tax_rate', value: '8.5', valueType: 'number', description: 'Default tax rate percentage' },
      { key: 'currency', value: 'USD', valueType: 'string', description: 'Default currency' },
      { key: 'features', value: JSON.stringify(['inventory', 'customers', 'reports']), valueType: 'json', description: 'Enabled features' },
      { key: 'theme', value: 'default', valueType: 'string', description: 'UI theme' }
    ];

    for (const setting of defaultSettings) {
      await prisma.businessTypeSetting.upsert({
        where: {
          businessTypeId_key: {
            businessTypeId: businessType.id,
            key: setting.key
          }
        },
        update: setting,
        create: {
          ...setting,
          businessTypeId: businessType.id
        }
      });
    }
  }

  // Create default store settings
  const defaultBusinessType = await prisma.businessType.findFirst({
    where: { code: 'retail' }
  });

  if (defaultBusinessType) {
    const storeSettings = await prisma.storeSettings.upsert({
      where: { id: 1 }, // Assuming single store for now
      update: {},
      create: {
        businessTypeId: defaultBusinessType.id,
        storeName: 'My POS Store',
        currency: 'USD',
        timezone: 'America/New_York',
        taxRate: 8.5
      }
    });
    console.log('🏪 Created default store settings with business type:', defaultBusinessType.name);
  }

  console.log('✅ Basic seed completed successfully!');
    console.log('\n🔐 Login Credentials for Testing:');
    console.log('Admin: admin@essen.com / admin123');
    console.log('Manager: manager@essen.com / manager123');
    console.log('Cashier 1: cashier1@essen.com / cashier123');
    console.log('Cashier 2: cashier2@essen.com / cashier123');

  } catch (error) {
    console.error('❌ Basic seed failed:', error);
    // Continue with the rest of the seed even if users fail
  }

  // Create sample suppliers
  const suppliersData = [
    {
      name: 'Global Coffee Co',
      email: 'orders@globalcoffee.com',
      phone: '+1-555-1000',
      address: '123 Bean Street',
      city: 'Coffeeville',
      state: 'WA',
      zipCode: '98102',
      country: 'US',
      contactPerson: 'Maria Rodriguez',
      paymentTerms: 'Net 30',
      taxId: 'WH-123456789',
      notes: 'Primary coffee supplier, excellent quality beans'
    },
    {
      name: 'Farm Fresh Dairy',
      email: 'sales@farmfreshdairy.com',
      phone: '+1-555-1001',
      address: '456 Dairy Lane',
      city: 'Milktown',
      state: 'WI',
      zipCode: '53562',
      country: 'US',
      contactPerson: 'John Anderson',
      paymentTerms: 'Net 15',
      taxId: 'WH-987654321',
      notes: 'Local dairy supplier, organic products'
    },
    {
      name: 'Local Bakery Co',
      email: 'orders@localbakery.com',
      phone: '+1-555-1002',
      address: '789 Flour Drive',
      city: 'Bakerstown',
      state: 'CA',
      zipCode: '90001',
      country: 'US',
      contactPerson: 'Charlie Baker',
      paymentTerms: 'Net 30',
      taxId: 'WH-555666777',
      notes: 'Artisanal bakery, fresh daily deliveries'
    },
    {
      name: 'Chocolate Heaven',
      email: 'contact@chocolateheaven.com',
      phone: '+1-555-1003',
      address: '321 Sweet Avenue',
      city: 'Candy City',
      state: 'PA',
      zipCode: '19102',
      country: 'US',
      contactPerson: 'Sophie Dupont',
      paymentTerms: 'Net 60',
      taxId: 'WH-444333222',
      notes: 'Premium chocolate importer'
    },
    {
      name: 'Organic Farms',
      email: 'produce@organicfarms.com',
      phone: '+1-555-1004',
      address: '654 Organic Way',
      city: 'Greentown',
      state: 'OR',
      zipCode: '97301',
      country: 'US',
      contactPerson: 'Emma Green',
      paymentTerms: 'Net 30',
      taxId: 'WH-777888999',
      notes: 'Certified organic produce'
    },
    {
      name: 'Greek Yogurt Corp',
      email: 'bulk@greekyogurtcorp.com',
      phone: '+1-555-1005',
      address: '987 Yogurt Blvd',
      city: 'Yogurtville',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      contactPerson: 'Nick Papadopoulos',
      paymentTerms: 'Net 45',
      taxId: 'WH-222111000',
      notes: 'Frozen yogurt wholesale'
    },
    {
      name: 'Artisan Bakery',
      email: 'specialty@artisanbakery.com',
      phone: '+1-555-1006',
      address: '147 Artisan Street',
      city: 'Craftown',
      state: 'CO',
      zipCode: '80202',
      country: 'US',
      contactPerson: 'Marie LaCroix',
      paymentTerms: 'Net 30',
      taxId: 'WH-333222111',
      notes: 'Specialty breads and pastries'
    },
    {
      name: 'Craft Beer Distributors',
      email: 'orders@craftbeerdist.com',
      phone: '+1-555-1007',
      address: '258 Brewery Road',
      city: 'Brewtown',
      state: 'MI',
      zipCode: '48201',
      country: 'US',
      contactPerson: 'Tom Lager',
      paymentTerms: 'Net 30',
      taxId: 'WH-666555444',
      notes: 'Local craft beer varieties'
    },
    {
      name: 'Honey Farms',
      email: 'sales@honeyfarms.com',
      phone: '+1-555-1008',
      address: '369 Bee Lane',
      city: 'Sweetville',
      state: 'FL',
      zipCode: '32801',
      country: 'US',
      contactPerson: 'Anna Buzz',
      paymentTerms: 'Net 30',
      taxId: 'WH-888999000',
      notes: 'Pure wildflower honey'
    },
    {
      name: 'Italian Imports',
      email: 'imports@italianimports.com',
      phone: '+1-555-1009',
      address: '741 Olive Grove',
      city: 'Olivetown',
      state: 'CA',
      zipCode: '95014',
      country: 'US',
      contactPerson: 'Marco Rossi',
      paymentTerms: 'Net 60',
      taxId: 'WH-111222333',
      notes: 'Italian food imports'
    }
  ];

  for (const supplierData of suppliersData) {
    const supplier = await prisma.supplier.upsert({
      where: { email: supplierData.email },
      update: {},
      create: supplierData
    });
    console.log('🏭 Created supplier:', supplier.name);
  }

  // Create sample warehouses
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'MAIN',
      address: '123 Factory Street',
      city: 'Industrial City',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      manager: 'Bob Warehouse',
      phone: '+1-555-2000'
    }
  });

  console.log('🏢 Created warehouse:', mainWarehouse.name);

  // Create warehouse locations
  const locations = [
    { aisle: 'A', shelf: '1', bin: '01', locationCode: 'A-1-01', maxCapacity: 1000.0 },
    { aisle: 'A', shelf: '1', bin: '02', locationCode: 'A-1-02', maxCapacity: 800.0 },
    { aisle: 'B', shelf: '2', bin: '01', locationCode: 'B-2-01', maxCapacity: 500.0 },
    { aisle: 'B', shelf: '2', bin: '02', locationCode: 'B-2-02', maxCapacity: 600.0 },
    { aisle: 'C', shelf: '3', bin: '01', locationCode: 'C-3-01', maxCapacity: 300.0 },
    { aisle: 'C', shelf: '3', bin: '02', locationCode: 'C-3-02', maxCapacity: 400.0 },
    { aisle: 'D', shelf: '4', bin: '01', locationCode: 'D-4-01', maxCapacity: 200.0 },
    { aisle: 'E', shelf: '5', bin: '01', locationCode: 'E-5-01', maxCapacity: 150.0 },
    { aisle: 'F', shelf: '6', bin: '01', locationCode: 'F-6-01', maxCapacity: 700.0 },
    { aisle: 'F', shelf: '6', bin: '02', locationCode: 'F-6-02', maxCapacity: 800.0 }
  ];

  for (const location of locations) {
    const warehouseLocation = await prisma.warehouseLocation.upsert({
      where: { locationCode: location.locationCode },
      update: {},
      create: {
        ...location,
        warehouseId: mainWarehouse.id
      }
    });
    console.log('📦 Created location:', warehouseLocation.locationCode);
  }

  // Create sample products - Expanded for better testing and search
  const productsData = [
    // Beverages (8 products)
    {
      name: 'Premium Arabica Coffee',
      description: 'High-quality arabica coffee beans from Colombia',
      barcode: '123456789012',
      sku: 'CF-001',
      type: 'unit',
      category: 'Beverages',
      cost: 8.50,
      price: 15.99,
      stockQty: 50,
      minStockLevel: 10,
      supplier: 'Global Coffee Co',
      location: 'Aisle 3, Shelf B'
    },
    {
      name: 'Espresso Ground Coffee',
      description: 'Finely ground espresso blend',
      barcode: '123456789022',
      sku: 'CF-002',
      type: 'unit',
      category: 'Beverages',
      cost: 7.25,
      price: 13.49,
      stockQty: 35,
      minStockLevel: 8,
      supplier: 'Global Coffee Co',
      location: 'Aisle 3, Shelf B'
    },
    {
      name: 'Decaf Coffee Beans',
      description: 'Premium decaffeinated coffee beans',
      barcode: '123456789023',
      sku: 'CF-003',
      type: 'unit',
      category: 'Beverages',
      cost: 9.00,
      price: 16.99,
      stockQty: 28,
      minStockLevel: 6,
      supplier: 'Global Coffee Co',
      location: 'Aisle 3, Shelf C'
    },
    {
      name: 'Green Tea Bags',
      description: 'Organic green tea bags - 20 count',
      barcode: '123456789024',
      sku: 'TE-001',
      type: 'pack',
      category: 'Beverages',
      cost: 3.50,
      price: 7.99,
      stockQty: 45,
      minStockLevel: 10,
      conversionRate: 20,
      supplier: 'Global Coffee Co',
      location: 'Aisle 3, Shelf D'
    },
    {
      name: 'Black Tea Premium',
      description: 'Earl Grey premium black tea',
      barcode: '123456789025',
      sku: 'TE-002',
      type: 'unit',
      category: 'Beverages',
      cost: 4.25,
      price: 8.99,
      stockQty: 32,
      minStockLevel: 8,
      supplier: 'Global Coffee Co',
      location: 'Aisle 3, Shelf D'
    },
    {
      name: 'Craft Beer IPA Pack',
      description: '6-pack of premium IPA craft beer',
      barcode: '123456789019',
      sku: 'BE-001',
      type: 'pack',
      category: 'Beverages',
      cost: 18.00,
      price: 32.99,
      stockQty: 25,
      minStockLevel: 5,
      conversionRate: 6,
      supplier: 'Craft Beer Distributors',
      location: 'Beer Section, Cooler A'
    },
    {
      name: 'Stout Beer Variety',
      description: '6-pack of craft stout beers',
      barcode: '123456789026',
      sku: 'BE-002',
      type: 'pack',
      category: 'Beverages',
      cost: 19.50,
      price: 34.99,
      stockQty: 18,
      minStockLevel: 4,
      conversionRate: 6,
      supplier: 'Craft Beer Distributors',
      location: 'Beer Section, Cooler A'
    },
    {
      name: 'Sparkling Water Case',
      description: '24-pack of sparkling mineral water',
      barcode: '123456789027',
      sku: 'WA-001',
      type: 'wholesale',
      category: 'Beverages',
      cost: 12.00,
      price: 24.99,
      stockQty: 8,
      minStockLevel: 3,
      conversionRate: 24,
      supplier: 'Global Coffee Co',
      location: 'Aisle 4, Shelf A'
    },

    // Dairy Products (6 products)
    {
      name: 'Organic Whole Milk',
      description: 'Fresh organic whole milk - 1 liter',
      barcode: '123456789013',
      sku: 'ML-001',
      type: 'unit',
      category: 'Dairy',
      cost: 2.25,
      price: 4.99,
      stockQty: 30,
      minStockLevel: 8,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 2'
    },
    {
      name: 'Low-Fat Milk 2%',
      description: 'Low-fat milk - 1 liter',
      barcode: '123456789028',
      sku: 'ML-002',
      type: 'unit',
      category: 'Dairy',
      cost: 2.10,
      price: 4.49,
      stockQty: 25,
      minStockLevel: 7,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 2'
    },
    {
      name: 'Greek Yogurt Plain',
      description: 'Plain Greek yogurt - 500g',
      barcode: '123456789029',
      sku: 'YG-002',
      type: 'unit',
      category: 'Dairy',
      cost: 3.75,
      price: 7.99,
      stockQty: 40,
      minStockLevel: 10,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 3'
    },
    {
      name: 'Cheddar Cheese Block',
      description: 'Aged cheddar cheese - 500g',
      barcode: '123456789030',
      sku: 'CH-002',
      type: 'unit',
      category: 'Dairy',
      cost: 8.50,
      price: 16.99,
      stockQty: 15,
      minStockLevel: 4,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 4'
    },
    {
      name: 'Butter Unsalted',
      description: 'Unsalted butter - 250g',
      barcode: '123456789031',
      sku: 'BU-001',
      type: 'unit',
      category: 'Dairy',
      cost: 4.25,
      price: 8.49,
      stockQty: 22,
      minStockLevel: 6,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 5'
    },
    {
      name: 'Heavy Cream',
      description: 'Heavy whipping cream - 500ml',
      barcode: '123456789032',
      sku: 'CR-001',
      type: 'unit',
      category: 'Dairy',
      cost: 3.00,
      price: 6.49,
      stockQty: 18,
      minStockLevel: 5,
      supplier: 'Farm Fresh Dairy',
      location: 'Cold Storage, Row 6'
    },

    // Bakery Products (6 products)
    {
      name: 'Whole Wheat Bread',
      description: 'Freshly baked whole wheat loaf',
      barcode: '123456789014',
      sku: 'BR-001',
      type: 'unit',
      category: 'Bakery',
      cost: 1.75,
      price: 3.49,
      stockQty: 20,
      minStockLevel: 5,
      supplier: 'Local Bakery Co',
      location: 'Bakery Section, Rack 1'
    },
    {
      name: 'Sourdough Bread Loaf',
      description: 'Artisanal sourdough bread',
      barcode: '123456789018',
      sku: 'SB-001',
      type: 'unit',
      category: 'Bakery',
      cost: 2.50,
      price: 6.99,
      stockQty: 12,
      minStockLevel: 4,
      supplier: 'Artisan Bakery',
      location: 'Bakery Display, Case 1'
    },
    {
      name: 'Croissant Butter',
      description: 'Fresh butter croissants - pack of 4',
      barcode: '123456789033',
      sku: 'CR-002',
      type: 'pack',
      category: 'Bakery',
      cost: 6.00,
      price: 12.99,
      stockQty: 16,
      minStockLevel: 4,
      conversionRate: 4,
      supplier: 'Local Bakery Co',
      location: 'Bakery Section, Rack 2'
    },
    {
      name: 'Chocolate Chip Cookies',
      description: 'Fresh baked chocolate chip cookies - 12 pack',
      barcode: '123456789034',
      sku: 'CO-001',
      type: 'pack',
      category: 'Bakery',
      cost: 8.50,
      price: 16.99,
      stockQty: 14,
      minStockLevel: 3,
      conversionRate: 12,
      supplier: 'Local Bakery Co',
      location: 'Bakery Section, Rack 3'
    },
    {
      name: 'Bagels Variety Pack',
      description: 'Assorted bagels - 6 pack',
      barcode: '123456789035',
      sku: 'BG-001',
      type: 'pack',
      category: 'Bakery',
      cost: 5.25,
      price: 10.99,
      stockQty: 20,
      minStockLevel: 5,
      conversionRate: 6,
      supplier: 'Local Bakery Co',
      location: 'Bakery Section, Rack 4'
    },
    {
      name: 'Muffin Blueberry',
      description: 'Fresh blueberry muffins - pack of 6',
      barcode: '123456789036',
      sku: 'MU-001',
      type: 'pack',
      category: 'Bakery',
      cost: 7.50,
      price: 14.99,
      stockQty: 11,
      minStockLevel: 3,
      conversionRate: 6,
      supplier: 'Local Bakery Co',
      location: 'Bakery Section, Rack 5'
    },

    // Produce (8 products)
    {
      name: 'Organic Bananas',
      description: 'Fresh organic bananas per pound',
      barcode: '123456789016',
      sku: 'BN-001',
      type: 'unit',
      category: 'Produce',
      cost: 0.75,
      price: 1.29,
      stockQty: 80,
      minStockLevel: 20,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Red Apples',
      description: 'Fresh red delicious apples per pound',
      barcode: '123456789037',
      sku: 'AP-001',
      type: 'unit',
      category: 'Produce',
      cost: 1.25,
      price: 2.49,
      stockQty: 60,
      minStockLevel: 15,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Strawberries',
      description: 'Fresh organic strawberries - 1 pint',
      barcode: '123456789038',
      sku: 'SB-002',
      type: 'unit',
      category: 'Produce',
      cost: 3.50,
      price: 6.99,
      stockQty: 25,
      minStockLevel: 8,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Broccoli Crowns',
      description: 'Fresh broccoli crowns per pound',
      barcode: '123456789039',
      sku: 'BR-002',
      type: 'unit',
      category: 'Produce',
      cost: 2.00,
      price: 3.99,
      stockQty: 35,
      minStockLevel: 10,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Carrots Baby',
      description: 'Baby carrots - 1 pound bag',
      barcode: '123456789040',
      sku: 'CA-001',
      type: 'unit',
      category: 'Produce',
      cost: 1.50,
      price: 2.99,
      stockQty: 45,
      minStockLevel: 12,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Spinach Fresh',
      description: 'Fresh spinach leaves - 10oz bag',
      barcode: '123456789041',
      sku: 'SP-001',
      type: 'unit',
      category: 'Produce',
      cost: 2.75,
      price: 5.49,
      stockQty: 28,
      minStockLevel: 7,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Avocados',
      description: 'Fresh Hass avocados - each',
      barcode: '123456789042',
      sku: 'AV-001',
      type: 'unit',
      category: 'Produce',
      cost: 1.75,
      price: 3.49,
      stockQty: 32,
      minStockLevel: 8,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },
    {
      name: 'Tomatoes Roma',
      description: 'Roma tomatoes per pound',
      barcode: '123456789043',
      sku: 'TO-001',
      type: 'unit',
      category: 'Produce',
      cost: 2.25,
      price: 4.49,
      stockQty: 38,
      minStockLevel: 10,
      supplier: 'Organic Farms',
      location: 'Produce Section'
    },

    // Confectionery (4 products)
    {
      name: 'Premium Chocolate Pack',
      description: 'Assorted premium chocolates',
      barcode: '123456789015',
      sku: 'CH-001',
      type: 'pack',
      category: 'Confectionery',
      cost: 12.00,
      price: 24.99,
      stockQty: 15,
      minStockLevel: 3,
      conversionRate: 6,
      supplier: 'Chocolate Heaven',
      location: 'Confectionery Aisle, Shelf C'
    },
    {
      name: 'Dark Chocolate Bar',
      description: '70% cocoa dark chocolate bar - 100g',
      barcode: '123456789044',
      sku: 'CH-003',
      type: 'unit',
      category: 'Confectionery',
      cost: 3.25,
      price: 6.99,
      stockQty: 40,
      minStockLevel: 10,
      supplier: 'Chocolate Heaven',
      location: 'Confectionery Aisle, Shelf C'
    },
    {
      name: 'Gummy Bears',
      description: 'Assorted gummy bears - 500g bag',
      barcode: '123456789045',
      sku: 'GB-001',
      type: 'unit',
      category: 'Confectionery',
      cost: 4.50,
      price: 9.99,
      stockQty: 22,
      minStockLevel: 6,
      supplier: 'Chocolate Heaven',
      location: 'Confectionery Aisle, Shelf D'
    },
    {
      name: 'Licorice Twists',
      description: 'Black licorice twists - 200g bag',
      barcode: '123456789046',
      sku: 'LI-001',
      type: 'unit',
      category: 'Confectionery',
      cost: 2.75,
      price: 5.99,
      stockQty: 18,
      minStockLevel: 5,
      supplier: 'Chocolate Heaven',
      location: 'Confectionery Aisle, Shelf D'
    },

    // Pantry Items (6 products)
    {
      name: 'Natural Honey Jar',
      description: 'Pure natural wildflower honey',
      barcode: '123456789020',
      sku: 'HN-001',
      type: 'unit',
      category: 'Pantry',
      cost: 6.25,
      price: 12.99,
      stockQty: 35,
      minStockLevel: 8,
      supplier: 'Honey Farms',
      location: 'Pantry Aisle, Shelf D'
    },
    {
      name: 'Extra Virgin Olive Oil',
      description: 'Premium imported extra virgin olive oil',
      barcode: '123456789021',
      sku: 'OL-001',
      type: 'unit',
      category: 'Pantry',
      cost: 9.75,
      price: 19.99,
      stockQty: 22,
      minStockLevel: 6,
      supplier: 'Italian Imports',
      location: 'Pantry Aisle, Shelf A'
    },
    {
      name: 'Quinoa Organic',
      description: 'Organic quinoa - 500g bag',
      barcode: '123456789047',
      sku: 'QU-001',
      type: 'unit',
      category: 'Pantry',
      cost: 5.50,
      price: 11.99,
      stockQty: 30,
      minStockLevel: 8,
      supplier: 'Organic Farms',
      location: 'Pantry Aisle, Shelf B'
    },
    {
      name: 'Brown Rice',
      description: 'Organic brown rice - 2kg bag',
      barcode: '123456789048',
      sku: 'RI-001',
      type: 'unit',
      category: 'Pantry',
      cost: 4.25,
      price: 8.99,
      stockQty: 25,
      minStockLevel: 6,
      supplier: 'Organic Farms',
      location: 'Pantry Aisle, Shelf B'
    },
    {
      name: 'Almond Butter',
      description: 'Natural almond butter - 500g jar',
      barcode: '123456789049',
      sku: 'AB-001',
      type: 'unit',
      category: 'Pantry',
      cost: 8.75,
      price: 17.99,
      stockQty: 16,
      minStockLevel: 4,
      supplier: 'Honey Farms',
      location: 'Pantry Aisle, Shelf C'
    },
    {
      name: 'Maple Syrup Pure',
      description: 'Pure maple syrup - 500ml bottle',
      barcode: '123456789050',
      sku: 'MS-001',
      type: 'unit',
      category: 'Pantry',
      cost: 7.50,
      price: 15.99,
      stockQty: 20,
      minStockLevel: 5,
      supplier: 'Honey Farms',
      location: 'Pantry Aisle, Shelf C'
    },

    // Frozen Foods (4 products)
    {
      name: 'Frozen Greek Yogurt',
      description: 'Premium Greek yogurt - wholesale pack',
      barcode: '123456789017',
      sku: 'YG-001',
      type: 'wholesale',
      category: 'Frozen',
      cost: 45.00,
      price: 89.99,
      stockQty: 5,
      minStockLevel: 2,
      conversionRate: 24,
      supplier: 'Greek Yogurt Corp',
      location: 'Freezer, Section 3'
    },
    {
      name: 'Frozen Blueberries',
      description: 'Organic frozen blueberries - 500g bag',
      barcode: '123456789051',
      sku: 'FB-001',
      type: 'unit',
      category: 'Frozen',
      cost: 6.25,
      price: 12.99,
      stockQty: 15,
      minStockLevel: 4,
      supplier: 'Organic Farms',
      location: 'Freezer, Section 1'
    },
    {
      name: 'Frozen Mixed Vegetables',
      description: 'Frozen mixed vegetables - 1kg bag',
      barcode: '123456789052',
      sku: 'FV-001',
      type: 'unit',
      category: 'Frozen',
      cost: 3.75,
      price: 7.49,
      stockQty: 28,
      minStockLevel: 7,
      supplier: 'Organic Farms',
      location: 'Freezer, Section 2'
    },
    {
      name: 'Frozen Pizza Margherita',
      description: 'Frozen Margherita pizza - 12 inch',
      barcode: '123456789053',
      sku: 'FP-001',
      type: 'unit',
      category: 'Frozen',
      cost: 8.50,
      price: 16.99,
      stockQty: 12,
      minStockLevel: 3,
      supplier: 'Greek Yogurt Corp',
      location: 'Freezer, Section 4'
    },

    // Specialty Items (4 products)
    {
      name: 'Vegan Protein Powder',
      description: 'Plant-based protein powder - vanilla - 500g',
      barcode: '123456789054',
      sku: 'VP-001',
      type: 'unit',
      category: 'Specialty',
      cost: 25.00,
      price: 49.99,
      stockQty: 8,
      minStockLevel: 2,
      supplier: 'Honey Farms',
      location: 'Specialty Aisle, Shelf A'
    },
    {
      name: 'Keto Snack Mix',
      description: 'Low-carb keto snack mix - 300g bag',
      barcode: '123456789055',
      sku: 'KS-001',
      type: 'unit',
      category: 'Specialty',
      cost: 12.50,
      price: 24.99,
      stockQty: 14,
      minStockLevel: 4,
      supplier: 'Honey Farms',
      location: 'Specialty Aisle, Shelf B'
    },
    {
      name: 'Gluten-Free Pasta',
      description: 'Gluten-free rice pasta - 500g pack',
      barcode: '123456789056',
      sku: 'GP-001',
      type: 'unit',
      category: 'Specialty',
      cost: 6.75,
      price: 13.99,
      stockQty: 18,
      minStockLevel: 5,
      supplier: 'Italian Imports',
      location: 'Specialty Aisle, Shelf C'
    },
    {
      name: 'Organic Baby Formula',
      description: 'Organic infant formula - 900g can',
      barcode: '123456789057',
      sku: 'BF-001',
      type: 'unit',
      category: 'Specialty',
      cost: 35.00,
      price: 69.99,
      stockQty: 6,
      minStockLevel: 2,
      supplier: 'Farm Fresh Dairy',
      location: 'Specialty Aisle, Shelf D'
    }
  ];

  // Location assignments for products - Updated for all products
  const productLocations = {
    // Beverages
    'Premium Arabica Coffee': 'A-1-01',
    'Espresso Ground Coffee': 'A-1-02',
    'Decaf Coffee Beans': 'A-1-03',
    'Green Tea Bags': 'A-1-04',
    'Black Tea Premium': 'A-1-05',
    'Craft Beer IPA Pack': 'A-1-06',
    'Stout Beer Variety': 'A-1-07',
    'Sparkling Water Case': 'A-1-08',

    // Dairy
    'Organic Whole Milk': 'B-2-01',
    'Low-Fat Milk 2%': 'B-2-02',
    'Greek Yogurt Plain': 'B-2-03',
    'Cheddar Cheese Block': 'B-2-04',
    'Butter Unsalted': 'B-2-05',
    'Heavy Cream': 'B-2-06',

    // Bakery
    'Whole Wheat Bread': 'C-3-01',
    'Sourdough Bread Loaf': 'C-3-02',
    'Croissant Butter': 'C-3-03',
    'Chocolate Chip Cookies': 'C-3-04',
    'Bagels Variety Pack': 'C-3-05',
    'Muffin Blueberry': 'C-3-06',

    // Produce
    'Organic Bananas': 'E-5-01',
    'Red Apples': 'E-5-02',
    'Strawberries': 'E-5-03',
    'Broccoli Crowns': 'E-5-04',
    'Carrots Baby': 'E-5-05',
    'Spinach Fresh': 'E-5-06',
    'Avocados': 'E-5-07',
    'Tomatoes Roma': 'E-5-08',

    // Confectionery
    'Premium Chocolate Pack': 'D-4-01',
    'Dark Chocolate Bar': 'D-4-02',
    'Gummy Bears': 'D-4-03',
    'Licorice Twists': 'D-4-04',

    // Pantry
    'Natural Honey Jar': 'F-6-01',
    'Extra Virgin Olive Oil': 'F-6-02',
    'Quinoa Organic': 'F-6-03',
    'Brown Rice': 'F-6-04',
    'Almond Butter': 'F-6-05',
    'Maple Syrup Pure': 'F-6-06',

    // Frozen
    'Frozen Greek Yogurt': 'F-6-07',
    'Frozen Blueberries': 'F-6-08',
    'Frozen Mixed Vegetables': 'F-6-09',
    'Frozen Pizza Margherita': 'F-6-10',

    // Specialty
    'Vegan Protein Powder': 'D-4-05',
    'Keto Snack Mix': 'D-4-06',
    'Gluten-Free Pasta': 'D-4-07',
    'Organic Baby Formula': 'D-4-08'
  };

  for (const productData of productsData) {
    // Find the supplier for this product
    const supplier = await prisma.supplier.findFirst({
      where: { name: productData.supplier }
    });

    // Find the warehouse location
    const locationCode = productLocations[productData.name];
    const warehouseLocation = locationCode ? await prisma.warehouseLocation.findFirst({
      where: { locationCode }
    }) : null;

    const product = await prisma.product.upsert({
      where: {
        barcode: productData.barcode
      },
      update: {
        stockQty: productData.stockQty, // Update stock if product exists
        updatedAt: new Date(),
        supplierId: supplier ? supplier.id : null,
        warehouseLocationId: warehouseLocation ? warehouseLocation.id : null
      },
      create: {
        ...productData,
        supplierId: supplier ? supplier.id : null,
        warehouseLocationId: warehouseLocation ? warehouseLocation.id : null
      }
    });

    console.log('📦 Created/updated product:', product.name, '- Supplier:', supplier ? supplier.name : 'None');
  }

  // Create sample customers for CRM
  const customersData = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1985-03-15'),
      address: '123 Oak Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
      loyaltyPoints: 250,
      totalSpent: 485.50,
      totalOrders: 8,
      lastVisit: new Date('2025-09-01'),
      averageOrderValue: 60.69,
      preferredPaymentMethod: 'credit_card',
      customerType: 'vip',
      marketingOptIn: true,
      status: 'active',
      notes: 'VIP customer, often purchases premium items. Prefers credit card payments.'
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      dateOfBirth: new Date('1992-07-22'),
      address: '456 Maple Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
      loyaltyPoints: 1750,
      totalSpent: 1234.75,
      totalOrders: 15,
      lastVisit: new Date('2025-08-28'),
      averageOrderValue: 82.32,
      preferredPaymentMethod: 'debit_card',
      customerType: 'wholesale',
      marketingOptIn: true,
      status: 'active',
      notes: 'Wholesale customer. Regular bulk purchases. Excellent customer.'
    },
    {
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'mike.davis@email.com',
      phone: '+1-555-0125',
      dateOfBirth: new Date('1978-11-30'),
      address: '789 Pine Road',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US',
      loyaltyPoints: 75,
      totalSpent: 124.20,
      totalOrders: 3,
      lastVisit: new Date('2025-07-15'),
      averageOrderValue: 41.40,
      preferredPaymentMethod: 'cash',
      customerType: 'regular',
      marketingOptIn: false,
      status: 'active',
      notes: 'New customer, prefers cash payments. Interested in dairy products.'
    },
    {
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'emily.w@email.com',
      phone: '+1-555-0126',
      dateOfBirth: new Date('1995-01-10'),
      address: '321 Elm Drive',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'US',
      loyaltyPoints: 420,
      totalSpent: 678.90,
      totalOrders: 12,
      lastVisit: new Date('2025-09-02'),
      averageOrderValue: 56.58,
      preferredPaymentMethod: 'credit_card',
      customerType: 'vip',
      marketingOptIn: true,
      status: 'active',
      notes: 'Loyal customer with high average order value. Birthday in January.'
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@email.com',
      phone: '+1-555-0127',
      dateOfBirth: new Date('1980-05-18'),
      address: '654 Cedar Lane',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'US',
      loyaltyPoints: 0,
      totalSpent: 25.99,
      totalOrders: 1,
      lastVisit: new Date('2025-06-20'),
      averageOrderValue: 25.99,
      preferredPaymentMethod: 'cash',
      customerType: 'regular',
      marketingOptIn: false,
      status: 'active',
      notes: 'First-time customer. Made a single small purchase.'
    },
    {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@email.com',
      phone: '+1-555-0128',
      dateOfBirth: new Date('1987-09-12'),
      address: '987 Birch Boulevard',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'US',
      loyaltyPoints: 95,
      totalSpent: 145.60,
      totalOrders: 4,
      lastVisit: new Date('2025-08-15'),
      averageOrderValue: 36.40,
      preferredPaymentMethod: 'debit_card',
      customerType: 'regular',
      marketingOptIn: true,
      status: 'active',
      notes: 'Regular customer with steady purchasing pattern.'
    },
    {
      firstName: 'Robert',
      lastName: 'Miller',
      email: null, // No email for some customers
      phone: '+1-555-0129',
      dateOfBirth: new Date('1975-12-03'),
      address: '147 Willow Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'US',
      loyaltyPoints: 350,
      totalSpent: 892.45,
      totalOrders: 14,
      lastVisit: new Date('2025-08-30'),
      averageOrderValue: 63.75,
      preferredPaymentMethod: 'credit_card',
      customerType: 'vip',
      marketingOptIn: false,
      status: 'active',
      notes: 'Loyal customer but no email marketing opt-in.'
    },
    {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jen.martinez@email.com',
      phone: '+1-555-0130',
      dateOfBirth: new Date('1990-04-25'),
      address: '258 Spruce Street',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'US',
      loyaltyPoints: 1100,
      totalSpent: 1567.30,
      totalOrders: 18,
      lastVisit: new Date('2025-09-01'),
      averageOrderValue: 87.07,
      preferredPaymentMethod: 'credit_card',
      customerType: 'wholesale',
      marketingOptIn: true,
      status: 'active',
      notes: 'High-value wholesale customer with consistent large orders.'
    }
  ];

  for (const customerData of customersData) {
    let customer;

    if (customerData.email) {
      // Use upsert for customers with emails
      customer = await prisma.customer.upsert({
        where: {
          email: customerData.email
        },
        update: customerData,
        create: customerData
      });
    } else {
      // Use create for customers without emails (since upsert requires non-null where fields)
      customer = await prisma.customer.create({
        data: customerData
      });
    }

    console.log('👥 Created/updated customer:', `${customer.firstName} ${customer.lastName}`);
  }

  // Create loyalty tiers
  const loyaltyTiers = [
    {
      name: 'Regular',
      minPoints: 0,
      pointsMultiplier: 1.0,
      benefits: 'Standard loyalty benefits',
      color: '#9CA3AF',
      isActive: true
    },
    {
      name: 'Silver',
      minPoints: 500,
      pointsMultiplier: 1.5,
      benefits: '1.5x points on all purchases, exclusive offers',
      color: '#9CA3AF',
      isActive: true
    },
    {
      name: 'Gold',
      minPoints: 1500,
      pointsMultiplier: 2.0,
      benefits: '2x points on all purchases, birthday rewards, priority service',
      color: '#FBBF24',
      isActive: true
    },
    {
      name: 'Platinum',
      minPoints: 3000,
      pointsMultiplier: 3.0,
      benefits: '3x points on all purchases, exclusive events, personal shopping assistant',
      color: '#10B981',
      isActive: true
    }
  ];

  for (const tierData of loyaltyTiers) {
    const tier = await prisma.loyaltyTier.upsert({
      where: { name: tierData.name },
      update: tierData,
      create: tierData
    });
    console.log('🏆 Created/updated loyalty tier:', tier.name);
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n🔐 Login Credentials for Testing:');
  console.log('Admin: admin@essen.com / admin123');
  console.log('Manager: manager@essen.com / manager123');
  console.log('Cashier 1: cashier1@essen.com / cashier123');
  console.log('Cashier 2: cashier2@essen.com / cashier123');
  console.log('\n📞 Sample Products Loaded:');
  console.log('- Use F1 for quick search');
  console.log('- Try barcode scanning with: 123456789012');
  console.log('- All products have realistic pricing and inventory');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
