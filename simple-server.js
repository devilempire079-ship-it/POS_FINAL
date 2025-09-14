const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run database queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const users = await runQuery('SELECT * FROM User WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await runQuery('UPDATE User SET lastLogin = ? WHERE id = ?', [new Date().toISOString(), user.id]);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      accessToken: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Products endpoint (public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await runQuery('SELECT * FROM Product WHERE isActive = 1 ORDER BY name');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Protected users endpoint
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await runQuery('SELECT id, name, email, role, isActive, lastLogin, createdAt FROM User');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Protected customers endpoint
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const customers = await runQuery('SELECT * FROM Customer WHERE status = ? ORDER BY createdAt DESC', ['active']);
    res.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Analytics endpoint
app.get('/api/analytics/realtime', authenticateToken, async (req, res) => {
  try {
    // Simple analytics - just return basic data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await runQuery('SELECT COUNT(*) as count, SUM(totalAmount) as total FROM Sale WHERE date >= ?', [today.toISOString()]);
    const products = await runQuery('SELECT COUNT(*) as count FROM Product WHERE isActive = 1');

    res.json({
      todaySales: sales[0].total || 0,
      totalTransactions: sales[0].count || 0,
      activeCustomers: 1,
      topProducts: []
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Permission Templates endpoint
app.get('/api/permissions/templates', authenticateToken, async (req, res) => {
  try {
    // Return mock permission templates
    const templates = [
      {
        id: 1,
        name: 'Admin Template',
        description: 'Full access to all system features',
        isSystem: true,
        isDefault: false,
        permissions: [
          { resource: 'dashboard', action: 'view', allowed: true },
          { resource: 'sales', action: 'view', allowed: true },
          { resource: 'sales', action: 'create', allowed: true },
          { resource: 'customers', action: 'view', allowed: true },
          { resource: 'customers', action: 'create', allowed: true },
          { resource: 'customers', action: 'edit', allowed: true },
          { resource: 'products', action: 'view', allowed: true },
          { resource: 'products', action: 'create', allowed: true },
          { resource: 'products', action: 'edit', allowed: true },
          { resource: 'inventory', action: 'view', allowed: true },
          { resource: 'reports', action: 'view', allowed: true },
          { resource: 'users', action: 'view', allowed: true },
          { resource: 'users', action: 'create', allowed: true },
          { resource: 'users', action: 'edit', allowed: true },
          { resource: 'settings', action: 'view', allowed: true },
          { resource: 'loyalty', action: 'view', allowed: true },
          { resource: 'suppliers', action: 'view', allowed: true }
        ],
        _count: { users: 1 }
      },
      {
        id: 2,
        name: 'Manager Template',
        description: 'Management access with some restrictions',
        isSystem: true,
        isDefault: false,
        permissions: [
          { resource: 'dashboard', action: 'view', allowed: true },
          { resource: 'sales', action: 'view', allowed: true },
          { resource: 'sales', action: 'create', allowed: true },
          { resource: 'customers', action: 'view', allowed: true },
          { resource: 'customers', action: 'create', allowed: true },
          { resource: 'customers', action: 'edit', allowed: true },
          { resource: 'products', action: 'view', allowed: true },
          { resource: 'products', action: 'create', allowed: true },
          { resource: 'products', action: 'edit', allowed: true },
          { resource: 'inventory', action: 'view', allowed: true },
          { resource: 'reports', action: 'view', allowed: true },
          { resource: 'settings', action: 'view', allowed: true },
          { resource: 'loyalty', action: 'view', allowed: true },
          { resource: 'suppliers', action: 'view', allowed: true }
        ],
        _count: { users: 1 }
      },
      {
        id: 3,
        name: 'Cashier Template',
        description: 'Basic sales and customer access',
        isSystem: true,
        isDefault: true,
        permissions: [
          { resource: 'dashboard', action: 'view', allowed: true },
          { resource: 'sales', action: 'view', allowed: true },
          { resource: 'sales', action: 'create', allowed: true },
          { resource: 'customers', action: 'view', allowed: true },
          { resource: 'customers', action: 'create', allowed: true },
          { resource: 'products', action: 'view', allowed: true },
          { resource: 'inventory', action: 'view', allowed: true }
        ],
        _count: { users: 1 }
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error('Error fetching permission templates:', error);
    res.status(500).json({ error: 'Failed to fetch permission templates' });
  }
});

// Create permission template
app.post('/api/permissions/templates', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create permission templates' });
    }

    const { name, description, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Name and permissions array required' });
    }

    // Create new template with mock data
    const newTemplate = {
      id: Date.now(), // Simple ID generation
      name,
      description,
      isSystem: false,
      isDefault: false,
      permissions,
      _count: { users: 0 }
    };

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating permission template:', error);
    res.status(500).json({ error: 'Failed to create permission template' });
  }
});

// Get user permissions
app.get('/api/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access this (own permissions or admin)
    if (req.userId !== parseInt(userId) && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user from database
    const users = await runQuery('SELECT * FROM User WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Return mock permissions based on user role
    let permissions = [];

    if (user.role === 'admin') {
      permissions = [
        { resource: 'dashboard', action: 'view', allowed: true },
        { resource: 'sales', action: 'view', allowed: true },
        { resource: 'sales', action: 'create', allowed: true },
        { resource: 'customers', action: 'view', allowed: true },
        { resource: 'customers', action: 'create', allowed: true },
        { resource: 'customers', action: 'edit', allowed: true },
        { resource: 'products', action: 'view', allowed: true },
        { resource: 'products', action: 'create', allowed: true },
        { resource: 'products', action: 'edit', allowed: true },
        { resource: 'inventory', action: 'view', allowed: true },
        { resource: 'reports', action: 'view', allowed: true },
        { resource: 'users', action: 'view', allowed: true },
        { resource: 'users', action: 'create', allowed: true },
        { resource: 'users', action: 'edit', allowed: true },
        { resource: 'settings', action: 'view', allowed: true },
        { resource: 'loyalty', action: 'view', allowed: true },
        { resource: 'suppliers', action: 'view', allowed: true }
      ];
    } else if (user.role === 'manager') {
      permissions = [
        { resource: 'dashboard', action: 'view', allowed: true },
        { resource: 'sales', action: 'view', allowed: true },
        { resource: 'sales', action: 'create', allowed: true },
        { resource: 'customers', action: 'view', allowed: true },
        { resource: 'customers', action: 'create', allowed: true },
        { resource: 'customers', action: 'edit', allowed: true },
        { resource: 'products', action: 'view', allowed: true },
        { resource: 'products', action: 'create', allowed: true },
        { resource: 'products', action: 'edit', allowed: true },
        { resource: 'inventory', action: 'view', allowed: true },
        { resource: 'reports', action: 'view', allowed: true },
        { resource: 'settings', action: 'view', allowed: true },
        { resource: 'loyalty', action: 'view', allowed: true },
        { resource: 'suppliers', action: 'view', allowed: true }
      ];
    } else if (user.role === 'cashier') {
      permissions = [
        { resource: 'dashboard', action: 'view', allowed: true },
        { resource: 'sales', action: 'view', allowed: true },
        { resource: 'sales', action: 'create', allowed: true },
        { resource: 'customers', action: 'view', allowed: true },
        { resource: 'customers', action: 'create', allowed: true },
        { resource: 'products', action: 'view', allowed: true },
        { resource: 'inventory', action: 'view', allowed: true }
      ];
    }

    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// Assign permission template to user
app.post('/api/users/:userId/assign-template', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign permission templates' });
    }

    const { userId } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID required' });
    }

    // Get user from database
    const users = await runQuery('SELECT * FROM User WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock template assignment - just return success
    res.json({ message: 'Permission template assigned successfully' });
  } catch (error) {
    console.error('Error assigning permission template:', error);
    res.status(500).json({ error: 'Failed to assign permission template' });
  }
});

// Update user permissions
app.put('/api/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update user permissions' });
    }

    const { userId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions array required' });
    }

    // Get user from database
    const users = await runQuery('SELECT * FROM User WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock permission update - just return success
    res.json({ message: 'User permissions updated successfully' });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: 'Failed to update user permissions' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple POS API Server running at http://localhost:${port}`);
  console.log('🔐 Authentication endpoints enabled');
  console.log('📊 Basic analytics available');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down simple server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down simple server...');
  db.close();
  process.exit(0);
});
