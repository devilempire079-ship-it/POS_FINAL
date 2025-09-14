// Mock product database for POS system
export const mockProducts = [
  // Phones
  {
    id: 'phone-1',
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    category: 'phones',
    stock: 15,
    barcode: '123456789012',
    description: 'Latest iPhone with Pro camera system'
  },
  {
    id: 'phone-2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    category: 'phones',
    stock: 12,
    barcode: '123456789013',
    description: 'Android flagship with S Pen'
  },
  {
    id: 'phone-3',
    name: 'Google Pixel 8 Pro',
    price: 999.99,
    category: 'phones',
    stock: 20,
    barcode: '123456789014',
    description: 'Pure Android experience with best camera'
  },
  {
    id: 'phone-4',
    name: 'OnePlus 12',
    price: 799.99,
    category: 'phones',
    stock: 18,
    barcode: '123456789015',
    description: 'Fast charging and smooth performance'
  },

  // Laptops
  {
    id: 'laptop-1',
    name: 'MacBook Pro 16" M3 Max',
    price: 3499.99,
    category: 'laptops',
    stock: 8,
    barcode: '223456789012',
    description: 'Professional laptop for creators'
  },
  {
    id: 'laptop-2',
    name: 'Dell XPS 13 Plus',
    price: 1499.99,
    category: 'laptops',
    stock: 10,
    barcode: '223456789013',
    description: 'Ultra-portable Windows laptop'
  },
  {
    id: 'laptop-3',
    name: 'Lenovo ThinkPad X1 Carbon',
    price: 1899.99,
    category: 'laptops',
    stock: 6,
    barcode: '223456789014',
    description: 'Business laptop with legendary keyboard'
  },
  {
    id: 'laptop-4',
    name: 'ASUS ROG Zephyrus G15',
    price: 1999.99,
    category: 'laptops',
    stock: 5,
    barcode: '223456789015',
    description: 'Gaming laptop with RTX 4080'
  },

  // Accessories
  {
    id: 'acc-1',
    name: 'AirPods Pro (2nd Gen)',
    price: 249.99,
    category: 'accessories',
    stock: 25,
    barcode: '323456789012',
    description: 'Wireless earbuds with active noise cancellation'
  },
  {
    id: 'acc-2',
    name: 'Magic Keyboard',
    price: 149.99,
    category: 'accessories',
    stock: 30,
    barcode: '323456789013',
    description: 'Wireless keyboard for Mac'
  },
  {
    id: 'acc-3',
    name: 'Logitech MX Master 3S',
    price: 99.99,
    category: 'accessories',
    stock: 20,
    barcode: '323456789014',
    description: 'Premium wireless mouse'
  },
  {
    id: 'acc-4',
    name: 'Samsung 49" Odyssey G9',
    price: 1499.99,
    category: 'accessories',
    stock: 3,
    barcode: '323456789015',
    description: 'Ultra-wide gaming monitor'
  },
  {
    id: 'acc-5',
    name: 'WD My Passport 5TB',
    price: 129.99,
    category: 'accessories',
    stock: 15,
    barcode: '323456789016',
    description: 'Portable external hard drive'
  },
  {
    id: 'acc-6',
    name: 'Anker PowerCore 20000',
    price: 59.99,
    category: 'accessories',
    stock: 40,
    barcode: '323456789017',
    description: 'Portable charger with fast charging'
  }
];

// Helper functions for product operations
export const searchProducts = (query, category = null) => {
  if (!query.trim()) return mockProducts;

  const filtered = mockProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.barcode.includes(query) ||
    product.id.toLowerCase().includes(query.toLowerCase())
  );

  if (category) {
    return filtered.filter(product => product.category === category);
  }

  return filtered;
};

export const getProductById = (id) => {
  return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category) => {
  return mockProducts.filter(product => product.category === category);
};

export const getCategories = () => {
  return [...new Set(mockProducts.map(product => product.category))];
};

export const updateProductStock = (id, newStock) => {
  const product = mockProducts.find(p => p.id === id);
  if (product) {
    product.stock = newStock;
  }
};
