const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const WebSocket = require('ws');

// Import security utilities
const {
  validateEnvironment,
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
  createRateLimiters,
  validateLogin,
  validateCustomerSearch,
  validateProductSearch,
  validateCustomerCreation,
  handleValidationErrors,
  sanitizeInput,
  corsOptions,
  securityHeaders,
  checkBruteForce,
  recordFailedAttempt,
  clearFailedAttempts,
  auditLog
} = require('./security');

// Import permissions middleware
const {
  checkPermission,
  userHasPermission,
  getUserPermissions,
  getPermissionTemplates,
  assignPermissionTemplate,
  updateUserPermissions,
  createPermissionTemplate,
  requireAdmin,
  requireManager
} = require('./permissions-middleware');

// Load environment variables
require('dotenv').config();

// Validate environment variables
validateEnvironment();

// Initialize Express app for backend API
const backendApp = express();
const port = process.env.PORT || 3004;

// Security middleware
if (process.env.ENABLE_HELMET !== 'false') {
  backendApp.use(securityHeaders);
}

// CORS middleware
if (process.env.ENABLE_CORS !== 'false') {
  backendApp.use(cors(corsOptions));
}

// Rate limiting
const { authLimiter, apiLimiter } = createRateLimiters();
backendApp.use('/api/auth/login', authLimiter);
backendApp.use('/api/', apiLimiter);

// Body parsing
backendApp.use(express.json({ limit: '10mb' }));
backendApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Prisma Client
const prisma = new PrismaClient();

// WebSocket server for real-time updates (ENABLED)
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 3001 });

// Store connected clients with terminal identification
const clients = new Map();

// Helper function to validate terminal ID
function validateTerminalId(terminalId) {
  if (!terminalId) return false;
  // Terminal ID should be alphanumeric with hyphens and underscores
  const terminalIdRegex = /^[a-zA-Z0-9_-]+$/;
  return terminalIdRegex.test(terminalId) && terminalId.length <= 50;
}

// Helper function to generate unique terminal ID
function generateTerminalId() {
  return `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// WebSocket event handlers
wss.on('connection', (ws, req) => {
  // Extract and validate terminal info from headers
  let terminalId = req.headers['x-terminal-id'];

  if (!validateTerminalId(terminalId)) {
    terminalId = generateTerminalId();
    console.log(`⚠️ Invalid terminal ID provided, generated: ${terminalId}`);
  }

  const userAgent = req.headers['user-agent'] || 'Unknown';

  console.log(`🔗 New WebSocket client connected: ${terminalId} (${userAgent})`);

  // Store client with metadata
  clients.set(ws, {
    terminalId,
    userAgent,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Send welcome message with terminal ID
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    data: {
      terminalId,
      message: 'Connected to POS server',
      timestamp: new Date()
    }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Message from ${terminalId}:`, message.type);

      // Update last activity
      const clientData = clients.get(ws);
      if (clientData) {
        clientData.lastActivity = new Date();
      }

      // Handle different message types
      switch (message.type) {
        case 'PING':
          ws.send(JSON.stringify({
            type: 'PONG',
            data: { timestamp: new Date() }
          }));
          break;

        case 'TERMINAL_INFO':
          // Update terminal information
          if (clientData) {
            clientData.terminalName = message.data.name;
            clientData.location = message.data.location;
            clientData.user = message.data.user;
            console.log(`📋 Updated terminal info for ${terminalId}:`, message.data);
          }
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    const clientData = clients.get(ws);
    console.log(`🔌 WebSocket client disconnected: ${clientData?.terminalId || 'Unknown'}`);
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    const clientData = clients.get(ws);
    console.error(`❌ WebSocket error for ${clientData?.terminalId || 'Unknown'}:`, error);
    clients.delete(ws);
  });
});

// Helper function to broadcast real-time updates with terminal tracking
function broadcastUpdate(update) {
  const message = JSON.stringify({
    ...update,
    serverTimestamp: new Date(),
    activeTerminals: clients.size
  });

  let broadcastCount = 0;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      broadcastCount++;
    }
  });

  console.log(`📡 Broadcasted ${update.type} to ${broadcastCount} terminals`);
}

// Helper function to get customer tier
async function getCustomerTier(customerId) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyPoints: true }
  });

  if (!customer) return null;

  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'desc' }
  });

  // Find the highest tier the customer qualifies for
  const tier = tiers.find(t => customer.loyaltyPoints >= t.minPoints);
  return tier || null;
}

// Helper function to update customer tier
async function updateCustomerTier(customerId) {
  const tier = await getCustomerTier(parseInt(customerId));

  if (tier) {
    await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: {
        loyaltyTier: tier.name,
        pointsMultiplier: tier.pointsMultiplier
      }
    });
  } else {
    // If no tier found, set to default
    await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: {
        loyaltyTier: null,
        pointsMultiplier: 1.0
      }
    });
  }

  return tier;
}

// JWT Verification Middleware (using imported function from security.js)
const verifyTokenMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      auditLog('AUTH_FAILED', null, 'auth', null, 'Missing or invalid authorization header', req);
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Use secure token verification from security.js
    const decoded = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true, name: true, email: true }
    });

    if (!user || !user.isActive) {
      auditLog('AUTH_FAILED', decoded.userId, 'auth', null, 'User not found or inactive', req);
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    auditLog('AUTH_SUCCESS', user.id, 'auth', null, 'Token verified successfully', req);
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      auditLog('AUTH_FAILED', null, 'auth', null, 'Token expired', req);
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Token verification error:', error);
    auditLog('AUTH_FAILED', null, 'auth', null, `Token verification error: ${error.message}`, req);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authentication endpoints
backendApp.post('/api/auth/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email, 'email');

    // Check brute force protection
    const attempts = checkBruteForce(sanitizedEmail);
    if (attempts >= 5) {
      auditLog('BRUTE_FORCE_BLOCKED', null, 'auth', null, `Login blocked for ${sanitizedEmail}`, req);
      return res.status(429).json({
        error: 'Account temporarily locked',
        message: 'Too many failed login attempts. Please try again later.'
      });
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      recordFailedAttempt(sanitizedEmail);
      auditLog('LOGIN_FAILED', null, 'auth', null, `Invalid email: ${sanitizedEmail}`, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      auditLog('LOGIN_FAILED_INACTIVE', user.id, 'auth', null, `Inactive account: ${sanitizedEmail}`, req);
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      recordFailedAttempt(sanitizedEmail);
      auditLog('LOGIN_FAILED', user.id, 'auth', null, `Invalid password for: ${sanitizedEmail}`, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(sanitizedEmail);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate secure tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    auditLog('LOGIN_SUCCESS', user.id, 'auth', null, `Successful login: ${sanitizedEmail}`, req);

    res.json({
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    auditLog('LOGIN_ERROR', null, 'auth', null, `Login error: ${error.message}`, req);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Real-time analytics endpoint
backendApp.get('/api/analytics/realtime', verifyTokenMiddleware, async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sales metrics
    const [todaySales, totalTransactions, activeCustomers, topProducts] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.sale.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.sale.groupBy({
        by: ['customerId'],
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          customerId: {
            not: null
          }
        }
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    const topProductsWithDetails = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId);
      return {
        product: product ? product.name : 'Unknown',
        sales: tp._sum.quantity || 0
      };
    });

    const metrics = {
      todaySales: todaySales._sum.totalAmount || 0,
      totalTransactions,
      activeCustomers: activeCustomers.length,
      topProducts: topProductsWithDetails
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

// Customer Management endpoints
backendApp.post('/api/customers', verifyTokenMiddleware, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      preferredPaymentMethod,
      customerType,
      marketingOptIn,
      notes
    } = req.body;

    // Check if email already exists (if provided)
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email }
      });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this email already exists' });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        city,
        state,
        zipCode,
        country: country || 'US',
        preferredPaymentMethod,
        customerType: customerType || 'regular',
        marketingOptIn: marketingOptIn || false,
        notes,
        // Default values for new customer
        loyaltyPoints: 0,
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        status: 'active',
        registrationDate: new Date()
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

backendApp.get('/api/customers', verifyTokenMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      customerType,
      status = 'active',
      sortBy = 'lastVisit',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';

    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip: offset,
      take: limitNum,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        loyaltyPoints: true,
        totalSpent: true,
        totalOrders: true,
        lastVisit: true,
        averageOrderValue: true,
        customerType: true,
        status: true,
        city: true,
        state: true,
        preferredPaymentMethod: true,
        marketingOptIn: true,
        registrationDate: true,
        createdAt: true
      }
    });

    const totalCount = await prisma.customer.count({ where });

    res.json({
      customers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// User endpoints (protected)
backendApp.post('/api/users', verifyTokenMiddleware, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (req.userRole !== 'admin') {
      auditLog('UNAUTHORIZED', req.userId, 'users', null, 'Attempted to create user without admin role', req);
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const sanitizedEmail = sanitizeInput(email, 'email');
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: sanitizeInput(name, 'name'),
        role,
        isActive: true
      }
    });

    auditLog('USER_CREATED', req.userId, 'users', user.id, `Created user: ${sanitizedEmail}`, req);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      auditLog('USER_CREATE_FAILED', req.userId, 'users', null, `Email already exists: ${email}`, req);
      res.status(400).json({ error: 'Email already exists' });
    } else {
      auditLog('USER_CREATE_ERROR', req.userId, 'users', null, `Error creating user: ${error.message}`, req);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

backendApp.get('/api/users', verifyTokenMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Enhanced Product endpoints (some protected)
backendApp.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

backendApp.post('/api/products', verifyTokenMiddleware, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        createdAt: new Date()
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

backendApp.put('/api/products/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Permission Management Endpoints (Admin Only)
backendApp.get('/api/permissions/templates', verifyTokenMiddleware, requireAdmin, async (req, res) => {
  try {
    const templates = await getPermissionTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching permission templates:', error);
    res.status(500).json({ error: 'Failed to fetch permission templates' });
  }
});

// Enhanced sales endpoint with terminal tracking
backendApp.post('/api/sales', verifyTokenMiddleware, async (req, res) => {
  const transaction = await prisma.$transaction(async (tx) => {
    try {
      const {
        items,
        totalAmount,
        subtotal,
        taxAmount,
        discount,
        paymentType,
        paymentRef,
        notes,
        cashierId,
        customerId,
        terminalId // Terminal identification for multi-terminal support
      } = req.body;

      if (!items || items.length === 0) {
        throw new Error('No items in sale');
      }

      // Validate terminal ID if provided
      if (terminalId && !validateTerminalId(terminalId)) {
        throw new Error('Invalid terminal ID format');
      }

      // Verify all products exist and have sufficient stock
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQty: true, name: true }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stockQty < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      // Create sale record with terminal tracking
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          subtotal,
          taxAmount,
          discount,
          paymentType,
          paymentRef,
          notes,
          cashierId,
          customerId,
          saleItems: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discount: item.discount || 0
            }))
          }
        },
        include: {
          saleItems: {
            include: { product: true }
          },
          cashier: true,
          customer: true
        }
      });

      // Update stock quantities
      await Promise.all(
        items.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: { decrement: item.quantity }
            }
          })
        )
      );

      return { sale, terminalId };
    } catch (error) {
      throw error;
    }
  });

  try {
    // Broadcast real-time update with terminal information
    broadcastUpdate({
      type: 'NEW_SALE',
      data: {
        id: transaction.sale.id,
        totalAmount: transaction.sale.totalAmount,
        paymentType: transaction.sale.paymentType,
        cashier: transaction.sale.cashier.name,
        customer: transaction.sale.customer ? `${transaction.sale.customer.firstName} ${transaction.sale.customer.lastName}` : null,
        terminalId: transaction.terminalId,
        timestamp: new Date()
      }
    });

    res.status(201).json(transaction.sale);
  } catch (error) {
    console.error('Error completing sale:', error);
    res.status(500).json({ error: 'Failed to complete sale' });
  }
});

// Business Type Management Endpoints
backendApp.get('/api/business-types', verifyTokenMiddleware, async (req, res) => {
  try {
    const businessTypes = await prisma.businessType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        settings: true
      }
    });
    res.json(businessTypes);
  } catch (error) {
    console.error('Error fetching business types:', error);
    res.status(500).json({ error: 'Failed to fetch business types' });
  }
});

backendApp.get('/api/business-types/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const businessType = await prisma.businessType.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        settings: true
      }
    });

    if (!businessType) {
      return res.status(404).json({ error: 'Business type not found' });
    }

    res.json(businessType);
  } catch (error) {
    console.error('Error fetching business type:', error);
    res.status(500).json({ error: 'Failed to fetch business type' });
  }
});

backendApp.post('/api/business-types', verifyTokenMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create business types' });
    }

    const { code, name, description, icon, sortOrder } = req.body;

    const businessType = await prisma.businessType.create({
      data: {
        code,
        name,
        description,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    res.status(201).json(businessType);
  } catch (error) {
    console.error('Error creating business type:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Business type code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create business type' });
    }
  }
});

backendApp.put('/api/business-types/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update business types' });
    }

    const businessType = await prisma.businessType.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(businessType);
  } catch (error) {
    console.error('Error updating business type:', error);
    res.status(500).json({ error: 'Failed to update business type' });
  }
});

// Store Settings Endpoints
backendApp.get('/api/store-settings', verifyTokenMiddleware, async (req, res) => {
  try {
    let storeSettings = await prisma.storeSettings.findFirst();

    // If no settings exist, create default
    if (!storeSettings) {
      storeSettings = await prisma.storeSettings.create({
        data: {
          storeName: 'My POS Store',
          currency: 'USD',
          timezone: 'America/New_York',
          taxRate: 0
        },
        include: {
          businessType: true
        }
      });
    } else {
      storeSettings = await prisma.storeSettings.findFirst({
        include: {
          businessType: true
        }
      });
    }

    res.json(storeSettings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'Failed to fetch store settings' });
  }
});

backendApp.put('/api/store-settings', verifyTokenMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update store settings' });
    }

    let storeSettings = await prisma.storeSettings.findFirst();

    if (storeSettings) {
      storeSettings = await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: req.body,
        include: {
          businessType: true
        }
      });
    } else {
      storeSettings = await prisma.storeSettings.create({
        data: req.body,
        include: {
          businessType: true
        }
      });
    }

    res.json(storeSettings);
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

backendApp.post('/api/store-settings/business-type', verifyTokenMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change business type' });
    }

    const { typeId } = req.body;

    // Verify business type exists
    const businessType = await prisma.businessType.findUnique({
      where: { id: parseInt(typeId) }
    });

    if (!businessType) {
      return res.status(404).json({ error: 'Business type not found' });
    }

    let storeSettings = await prisma.storeSettings.findFirst();

    if (storeSettings) {
      storeSettings = await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: { businessTypeId: parseInt(typeId) },
        include: {
          businessType: true
        }
      });
    } else {
      storeSettings = await prisma.storeSettings.create({
        data: {
          businessTypeId: parseInt(typeId),
          storeName: 'My POS Store',
          currency: 'USD',
          timezone: 'America/New_York',
          taxRate: 0
        },
        include: {
          businessType: true
        }
      });
    }

    res.json(storeSettings);
  } catch (error) {
    console.error('Error setting business type:', error);
    res.status(500).json({ error: 'Failed to set business type' });
  }
});

// Enhanced kitchen orders with terminal tracking
backendApp.get('/api/kitchen/orders', verifyTokenMiddleware, async (req, res) => {
  try {
    // This would typically fetch orders from a dedicated orders table
    // For now, return a sample response
    const orders = [
      {
        id: 1,
        tableNumber: 'T5',
        server: 'John Cashier',
        items: [
          { id: 1, name: 'Grilled Salmon', quantity: 2, status: 'being_prepared' },
          { id: 2, name: 'Caesar Salad', quantity: 1, status: 'ready' }
        ],
        orderTime: new Date(),
        status: 'active'
      }
    ];
    res.json(orders);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
});

// Online Order Management Endpoints
backendApp.post('/api/orders/online', verifyTokenMiddleware, async (req, res) => {
  try {
    const {
      externalOrderId,
      platform, // 'uber-eats', 'doordash', 'grubhub', 'website', 'phone'
      orderType, // 'takeout', 'delivery'
      customerInfo,
      items,
      deliveryAddress,
      estimatedPickupTime,
      estimatedDeliveryTime,
      specialInstructions,
      paymentMethod,
      totalAmount,
      terminalId
    } = req.body;

    // Validate required fields
    if (!externalOrderId || !platform || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: externalOrderId, platform, items' });
    }

    // Validate terminal ID if provided
    if (terminalId && !validateTerminalId(terminalId)) {
      return res.status(400).json({ error: 'Invalid terminal ID format' });
    }

    // Create online order record
    const onlineOrder = {
      id: Date.now(),
      externalOrderId,
      platform,
      orderType: orderType || 'takeout',
      customerInfo: {
        name: customerInfo?.name || 'Unknown Customer',
        phone: customerInfo?.phone || '',
        email: customerInfo?.email || '',
        ...customerInfo
      },
      items: items.map(item => ({
        id: Date.now() + Math.random(),
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        totalPrice: (item.price * (item.quantity || 1)),
        notes: item.notes || '',
        category: item.category || 'mains',
        prepTime: item.prepTime || 10
      })),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      estimatedPickupTime: estimatedPickupTime ? new Date(estimatedPickupTime) : null,
      estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      specialInstructions: specialInstructions || '',
      paymentMethod: paymentMethod || 'online',
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      status: 'received', // received, confirmed, preparing, ready, picked_up, delivered, cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
      terminalId: terminalId || generateTerminalId(),
      priority: platform === 'uber-eats' || platform === 'doordash' ? 'high' : 'normal'
    };

    console.log(`📱 Online order #${onlineOrder.id} received from ${platform} (${orderType})`);

    // Broadcast new online order to all terminals
    broadcastUpdate({
      type: 'ONLINE_ORDER_RECEIVED',
      data: {
        orderId: onlineOrder.id,
        externalOrderId,
        platform,
        orderType,
        customerName: onlineOrder.customerInfo.name,
        itemCount: items.length,
        totalAmount: onlineOrder.totalAmount,
        estimatedTime: onlineOrder.estimatedPickupTime || onlineOrder.estimatedDeliveryTime,
        priority: onlineOrder.priority,
        terminalId: onlineOrder.terminalId,
        timestamp: new Date()
      }
    });

    res.status(201).json({
      success: true,
      order: onlineOrder,
      message: `Online order from ${platform} received and sent to kitchen`
    });

  } catch (error) {
    console.error('Error creating online order:', error);
    res.status(500).json({ error: 'Failed to create online order' });
  }
});

// Get all online orders
backendApp.get('/api/orders/online', verifyTokenMiddleware, async (req, res) => {
  try {
    const { status, platform, limit = 50 } = req.query;

    // In a real implementation, this would query the database
    // For now, return sample data
    const sampleOrders = [
      {
        id: 1,
        externalOrderId: 'UE-12345',
        platform: 'uber-eats',
        orderType: 'delivery',
        customerInfo: { name: 'John Doe', phone: '555-0123' },
        status: 'preparing',
        totalAmount: 45.99,
        createdAt: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        id: 2,
        externalOrderId: 'DD-67890',
        platform: 'doordash',
        orderType: 'takeout',
        customerInfo: { name: 'Jane Smith', phone: '555-0456' },
        status: 'ready',
        totalAmount: 32.50,
        createdAt: new Date(Date.now() - 600000) // 10 minutes ago
      }
    ];

    let filteredOrders = sampleOrders;

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (platform) {
      filteredOrders = filteredOrders.filter(order => order.platform === platform);
    }

    res.json({
      orders: filteredOrders.slice(0, parseInt(limit)),
      total: filteredOrders.length
    });

  } catch (error) {
    console.error('Error fetching online orders:', error);
    res.status(500).json({ error: 'Failed to fetch online orders' });
  }
});

// Update online order status
backendApp.put('/api/orders/online/:id/status', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, terminalId } = req.body;

    // Validate terminal ID if provided
    if (terminalId && !validateTerminalId(terminalId)) {
      return res.status(400).json({ error: 'Invalid terminal ID format' });
    }

    const validStatuses = ['received', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // In a real implementation, this would update the database
    console.log(`📱 Online order #${id} status updated to ${status}`);

    // Broadcast status update
    broadcastUpdate({
      type: 'ONLINE_ORDER_STATUS_UPDATE',
      data: {
        orderId: parseInt(id),
        status,
        notes,
        terminalId: terminalId || generateTerminalId(),
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating online order status:', error);
    res.status(500).json({ error: 'Failed to update online order status' });
  }
});

// Send online order to kitchen
backendApp.post('/api/orders/online/:id/send-to-kitchen', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { terminalId } = req.body;

    // Validate terminal ID if provided
    if (terminalId && !validateTerminalId(terminalId)) {
      return res.status(400).json({ error: 'Invalid terminal ID format' });
    }

    // Sample order data - in real implementation, fetch from database
    const sampleOrder = {
      id: parseInt(id),
      externalOrderId: 'UE-12345',
      platform: 'uber-eats',
      orderType: 'delivery',
      customerInfo: { name: 'John Doe', phone: '555-0123' },
      items: [
        { name: 'Grilled Salmon', quantity: 2, prepTime: 15 },
        { name: 'Caesar Salad', quantity: 1, prepTime: 5 }
      ],
      totalAmount: 45.99
    };

    // Create kitchen order from online order
    const kitchenOrder = {
      id: Date.now(),
      tableNumber: `Online-${sampleOrder.platform.toUpperCase()}`,
      server: `Online-${sampleOrder.platform}`,
      terminalId: terminalId || generateTerminalId(),
      items: sampleOrder.items.map(item => ({
        ...item,
        status: 'ordered',
        startTime: new Date()
      })),
      orderTime: new Date(),
      status: 'active',
      priority: 'high',
      orderType: 'online',
      platform: sampleOrder.platform,
      customerName: sampleOrder.customerInfo.name,
      customerPhone: sampleOrder.customerInfo.phone
    };

    console.log(`🍽️ Online order #${id} sent to kitchen from Terminal ${kitchenOrder.terminalId}`);

    // Broadcast kitchen order update
    broadcastUpdate({
      type: 'KITCHEN_ORDER',
      data: {
        orderId: kitchenOrder.id,
        tableNumber: kitchenOrder.tableNumber,
        server: kitchenOrder.server,
        terminalId: kitchenOrder.terminalId,
        itemCount: kitchenOrder.items.length,
        priority: kitchenOrder.priority,
        orderType: 'online',
        platform: sampleOrder.platform,
        customerName: sampleOrder.customerInfo.name,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      kitchenOrder,
      message: 'Online order sent to kitchen'
    });

  } catch (error) {
    console.error('Error sending online order to kitchen:', error);
    res.status(500).json({ error: 'Failed to send online order to kitchen' });
  }
});

backendApp.post('/api/kitchen/orders', verifyTokenMiddleware, async (req, res) => {
  try {
    const { tableNumber, server, items, priority, terminalId } = req.body;

    // Validate terminal ID if provided
    if (terminalId && !validateTerminalId(terminalId)) {
      return res.status(400).json({ error: 'Invalid terminal ID format' });
    }

    // Create a new order (in a real implementation, this would save to database)
    const order = {
      id: Date.now(),
      tableNumber,
      server,
      terminalId: terminalId || generateTerminalId(),
      items: items.map(item => ({
        ...item,
        status: 'ordered',
        startTime: new Date()
      })),
      orderTime: new Date(),
      status: 'active',
      priority: priority || 'normal'
    };

    console.log(`🍽️ Order #${order.id} sent to kitchen from Terminal ${order.terminalId} for Table ${tableNumber}`);

    // Broadcast kitchen order update
    broadcastUpdate({
      type: 'KITCHEN_ORDER',
      data: {
        orderId: order.id,
        tableNumber,
        server,
        terminalId: order.terminalId,
        itemCount: items.length,
        priority,
        timestamp: new Date()
      }
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error creating kitchen order:', error);
    res.status(500).json({ error: 'Failed to create kitchen order' });
  }
});

// Table Management Endpoints
backendApp.get('/api/tables', verifyTokenMiddleware, async (req, res) => {
  try {
    // Sample table data - in a real implementation, this would come from database
    const tables = [
      { id: 1, number: 1, capacity: 4, status: 'available', occupiedSeats: 0, availableSeats: 4 },
      { id: 2, number: 2, capacity: 6, status: 'occupied', occupiedSeats: 4, availableSeats: 2 },
      { id: 3, number: 3, capacity: 2, status: 'available', occupiedSeats: 0, availableSeats: 2 },
      { id: 4, number: 4, capacity: 8, status: 'occupied', occupiedSeats: 6, availableSeats: 2 },
      { id: 5, number: 5, capacity: 4, status: 'available', occupiedSeats: 0, availableSeats: 4 }
    ];
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

backendApp.put('/api/tables/:id/status', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, terminalId } = req.body;

    // Validate terminal ID if provided
    if (terminalId && !validateTerminalId(terminalId)) {
      return res.status(400).json({ error: 'Invalid terminal ID format' });
    }

    // In a real implementation, this would update the table status in database
    console.log(`🪑 Table ${id} status updated to ${status} by Terminal ${terminalId || 'Unknown'}`);

    // Broadcast table status update
    broadcastUpdate({
      type: 'TABLE_STATUS_UPDATE',
      data: {
        tableId: parseInt(id),
        status,
        terminalId: terminalId || generateTerminalId(),
        timestamp: new Date()
      }
    });

    res.json({ success: true, message: `Table ${id} status updated to ${status}` });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ error: 'Failed to update table status' });
  }
});

// Loyalty Program Endpoints
backendApp.get('/api/loyalty/tiers', verifyTokenMiddleware, async (req, res) => {
  try {
    const tiers = await prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' }
    });
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty tiers' });
  }
});

backendApp.post('/api/loyalty/earn', verifyTokenMiddleware, async (req, res) => {
  try {
    const { customerId, points, reason } = req.body;

    // Create loyalty transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        customerId: parseInt(customerId),
        type: 'earned',
        points,
        reason: reason || 'Purchase'
      }
    });

    // Update customer points
    await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: {
        loyaltyPoints: { increment: points }
      }
    });

    // Update customer tier
    await updateCustomerTier(customerId);

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error earning loyalty points:', error);
    res.status(500).json({ error: 'Failed to earn loyalty points' });
  }
});

// Analytics Endpoints
backendApp.get('/api/analytics/overview', verifyTokenMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySales, totalSales, customerCount, productCount] = await Promise.all([
      prisma.sale.aggregate({
        where: { date: { gte: today } },
        _sum: { totalAmount: true },
        _count: true
      }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        _count: true
      }),
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } })
    ]);

    const analytics = {
      todaySales: todaySales._sum.totalAmount || 0,
      todayTransactions: todaySales._count,
      totalSales: totalSales._sum.totalAmount || 0,
      totalTransactions: totalSales._count,
      totalCustomers: customerCount,
      totalProducts: productCount
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Multi-terminal management endpoints
backendApp.get('/api/terminals', verifyTokenMiddleware, async (req, res) => {
  try {
    const terminals = Array.from(clients.values()).map(client => ({
      terminalId: client.terminalId,
      userAgent: client.userAgent,
      connectedAt: client.connectedAt,
      lastActivity: client.lastActivity,
      terminalName: client.terminalName,
      location: client.location,
      user: client.user
    }));

    res.json({
      terminals,
      totalConnected: terminals.length,
      serverInfo: {
        websocketPort: process.env.WEBSOCKET_PORT || 3001,
        apiPort: port,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Error fetching terminals:', error);
    res.status(500).json({ error: 'Failed to fetch terminals' });
  }
});

/* ===== TABLE ASSISTANCE REQUESTS ===== */

backendApp.post('/api/assistance-requests', verifyTokenMiddleware, async (req, res) => {
  try {
    const {
      tableId,
      tableNumber,
      serverId,
      serverName,
      assistanceType,
      priority,
      description
    } = req.body;

    // Validate required fields
    if (!tableId || !assistanceType || !priority || !description?.trim()) {
      return res.status(400).json({
        error: 'Missing required fields: tableId, assistanceType, priority, description'
      });
    }

    // Create assistance request record using Prisma
    const assistanceRequest = await prisma.assistanceRequest.create({
      data: {
        tableId: parseInt(tableId),
        tableNumber: tableNumber || `Table-${tableId}`,
        serverId: parseInt(serverId) || req.userId,
        serverName: serverName || req.user.name,
        assistanceType,
        priority,
        description: description.trim(),
        status: 'pending',
      }
    });

    console.log(`🆘 Assistance request #${assistanceRequest.id} submitted for Table ${assistanceRequest.tableNumber} (${assistanceType}).`);

    // Broadcast assistance request to all terminals
    broadcastUpdate({
      type: 'ASSISTANCE_REQUEST',
      data: {
        id: assistanceRequest.id,
        tableId: assistanceRequest.tableId,
        tableNumber: assistanceRequest.tableNumber,
        serverName: assistanceRequest.serverName,
        assistanceType,
        priority,
        description: assistanceRequest.description,
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    });

    // Log the assistance request
    auditLog('ASSISTANCE_REQUEST_SUBMITTED', req.userId, 'assistance', assistanceRequest.id,
      `Assistance requested for Table ${assistanceRequest.tableNumber}: ${assistanceType}`, req);

    res.status(201).json({
      success: true,
      assistanceRequest,
      message: 'Assistance request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating assistance request:', error);
    auditLog('ASSISTANCE_REQUEST_ERROR', req.userId, 'assistance', null,
      `Error creating assistance request: ${error.message}`, req);
    res.status(500).json({ error: 'Failed to submit assistance request' });
  }
});

backendApp.get('/api/assistance-requests', verifyTokenMiddleware, async (req, res) => {
  try {
    const { status, priority } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const assistanceRequests = await prisma.assistanceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary
    const allRequests = await prisma.assistanceRequest.findMany();
    const summary = {
      pending: allRequests.filter(r => r.status === 'pending').length,
      in_progress: allRequests.filter(r => r.status === 'in_progress').length,
      completed: allRequests.filter(r => r.status === 'completed').length
    };

    res.json({
      assistanceRequests,
      total: assistanceRequests.length,
      summary
    });

  } catch (error) {
    console.error('Error fetching assistance requests:', error);
    res.status(500).json({ error: 'Failed to fetch assistance requests' });
  }
});

backendApp.put('/api/assistance-requests/:id/status', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update assistance request status in database
    const updatedRequest = await prisma.assistanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    console.log(`📋 Assistance request #${id} status updated to ${status}`);

    // Broadcast status update
    broadcastUpdate({
      type: 'ASSISTANCE_REQUEST_UPDATE',
      data: {
        id: parseInt(id),
        status,
        notes,
        updatedBy: req.user?.name || 'Staff',
        terminalId: generateTerminalId(),
        timestamp: new Date().toISOString()
      }
    });

    // Log status change
    auditLog('ASSISTANCE_REQUEST_STATUS_UPDATE', req.userId, 'assistance', parseInt(id),
      `Status changed to ${status}`, req);

    res.json({
      success: true,
      assistanceRequest: updatedRequest,
      message: `Assistance request status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating assistance request status:', error);
    res.status(500).json({ error: 'Failed to update assistance request status' });
  }
});

/* ===== NOTIFICATION SYSTEM ===== */

backendApp.post('/api/notifications', verifyTokenMiddleware, async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      priority = 'normal',
      initiatedBy,
      location,
      timestamp
    } = req.body;

    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, message'
      });
    }

    // Create notification record using Prisma
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        initiatedBy: initiatedBy || req.user?.name || 'System',
        location: location || 'Unknown',
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        read: false
      }
    });

    console.log(`🔔 ${priority.toUpperCase()} Notification: ${title}`);

    // Broadcast notification to all terminals (helpers, managers, etc.)
    broadcastUpdate({
      type: 'NOTIFICATION',
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        initiatedBy: notification.initiatedBy,
        location: notification.location,
        timestamp: notification.timestamp.toISOString(),
        read: false,
        serverTimestamp: new Date()
      }
    });

    // Log the notification
    auditLog('NOTIFICATION_SENT', req.userId, 'notifications', notification.id,
      `${type} notification sent: ${title}`, req);

    res.status(201).json({
      success: true,
      notification,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    auditLog('NOTIFICATION_ERROR', req.userId, 'notifications', null,
      `Error sending notification: ${error.message}`, req);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

backendApp.get('/api/notifications', verifyTokenMiddleware, async (req, res) => {
  try {
    const { type, priority, read } = req.query;

    // Build where clause
    const where = {};
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (read !== undefined) where.read = read === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      notifications,
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

backendApp.put('/api/notifications/:id/read', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Update notification as read in database
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        read: true,
        readAt: new Date(),
        readBy: req.userId
      }
    });

    console.log(`📖 Notification #${id} marked as read by ${req.user?.name || 'User'}`);

    // Broadcast read update (for real-time sync across devices)
    broadcastUpdate({
      type: 'NOTIFICATION_READ',
      data: {
        notificationId: parseInt(id),
        readBy: req.user?.name || 'User',
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ===== PHARMACY PRESCRIPTION SYSTEM =====

// Prescription upload and validation endpoints
backendApp.post('/api/pharmacy/prescriptions/upload', verifyTokenMiddleware, async (req, res) => {
  try {
    const { prescriptionId, customerId, imageData, imageName, origSeqNum } = req.body;

    if (!imageData || !customerId) {
      return res.status(400).json({ error: 'Missing required fields: imageData, customerId' });
    }

    // Validate prescription ID format (DEANum + Date + Sequence)
    const prescriptionIdRegex = /^[A-Z0-9]{2}\d{6}\d{3}[A-Z]?$/;
    if (prescriptionId && !prescriptionIdRegex.test(prescriptionId)) {
      return res.status(400).json({ error: 'Invalid prescription ID format' });
    }

    // Create prescription document record
    const prescriptionDoc = {
      id: Date.now(),
      prescriptionId: prescriptionId || `RX-${Date.now()}`,
      customerId: parseInt(customerId),
      pharmacistId: req.userId,
      status: 'uploaded',
      imagePath: `/uploads/prescriptions/${Date.now()}-${imageName || 'prescription.jpg'}`,
      uploadDate: new Date(),
      validationStatus: 'pending',
      origSeqNum: origSeqNum || null,
      checkSum: crypto.createHash('sha256').update(imageData).digest('hex')
    };

    // Log the prescription upload
    auditLog('PRESCRIPTION_UPLOAD', req.userId, 'prescription', prescriptionDoc.id,
      `Uploaded prescription ${prescriptionDoc.prescriptionId} for customer ${customerId}`, req);

    console.log(`📄 Prescription ${prescriptionDoc.prescriptionId} uploaded for customer ${customerId}`);

    res.status(201).json({
      success: true,
      prescription: prescriptionDoc,
      message: 'Prescription uploaded successfully, OCR processing starting...'
    });

  } catch (error) {
    console.error('Error uploading prescription:', error);
    res.status(500).json({ error: 'Failed to upload prescription' });
  }
});

// Prescription OCR and validation endpoint
backendApp.post('/api/pharmacy/prescriptions/validate', verifyTokenMiddleware, async (req, res) => {
  try {
    const { prescriptionId, imageData } = req.body;

    if (!prescriptionId) {
      return res.status(400).json({ error: 'Missing prescription ID' });
    }

    // Mock OCR processing (in real implementation, would use Tesseract or Azure Vision)
    const ocrResult = await simulateOCRProcessing(imageData);

    // Validate prescription fields
    const validation = validatePrescriptionFields(ocrResult);

    // Create validation audit log
    const validationAudit = {
      id: Date.now(),
      prescriptionId,
      pharmacistId: req.userId,
      validationOutcome: validation.isValid,
      ocrConfidence: 0.85,
      requiredFields: validation.requiredFieldsPresent,
      validationErrors: validation.errors,
      timestamp: new Date(),
      checksum: crypto.createHash('sha256').update(JSON.stringify(validation)).digest('hex')
    };

    console.log(`🔍 Prescription ${prescriptionId} validation ${validation.isValid ? 'PASSED' : 'FAILED'}`);

    // Log validation result
    auditLog('PRESCRIPTION_VALIDATION', req.userId, 'prescription', prescriptionId,
      `Validation ${validation.isValid ? 'PASSED' : 'FAILED'}: ${validation.errors.join(', ')}`, req);

    res.json({
      success: true,
      validation: validationAudit,
      ocrData: ocrResult,
      message: validation.isValid ? 'Prescription validated successfully' : 'Validation failed',
      errors: validation.errors
    });

  } catch (error) {
    console.error('Error validating prescription:', error);
    res.status(500).json({ error: 'Prescription validation failed' });
  }
});

// Get prescription details
backendApp.get('/api/pharmacy/prescriptions/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock prescription data - in real system, would fetch from database
    const mockPrescription = {
      id: parseInt(id),
      externalId: `RX-${Date.now()}`,
      customerName: 'John Doe',
      patientId: 'P001',
      doctor: 'Dr. Smith',
      medication: 'Lisinopril 10mg',
      dosage: '1 tablet daily',
      quantity: 30,
      refills: 3,
      writtenDate: '2025-01-15',
      validated: true,
      status: 'ready'
    };

    res.json(mockPrescription);

  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Mock OCR processing function
async function simulateOCRProcessing(imageData) {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock prescription data extraction
  return {
    patientName: 'John Smith',
    patientDOB: '1965-03-15',
    doctorName: 'Dr. Jane Wilson',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    quantity: '30',
    refills: '3',
    directions: 'Take 1 tablet daily',
    dateWritten: '2025-01-15',
    doctorDEA: '1234567890',
    pharmacyName: 'Local Pharmacy',
    instructions: 'Take with food if stomach upset occurs'
  };
}

// Mock prescription validation function
function validatePrescriptionFields(ocrData) {
  const requiredFields = ['patientName', 'doctorName', 'medicationName', 'dosage', 'quantity'];
  const errors = [];
  let requiredFieldsPresent = true;

  // Check required fields
  requiredFields.forEach(field => {
    if (!ocrData[field] || ocrData[field].trim() === '') {
      requiredFieldsPresent = false;
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Additional validations
  if (ocrData.quantity && isNaN(ocrData.quantity)) {
    errors.push('Invalid quantity format');
  }

  if (ocrData.dosage && !/\d+(\.\d+)?\s*(mg|g|mcg|ml|%)?$/.test(ocrData.dosage)) {
    errors.push('Invalid dosage format');
  }

  return {
    isValid: requiredFieldsPresent && errors.length === 0,
    requiredFieldsPresent,
    errors,
    warnings: []
  };
}

// Health check endpoint for frontend connectivity testing
backendApp.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      api: 'running',
      websocket: 'running',
      database: 'connected'
    }
  });
});

// Start Express server (Single startup point)
backendApp.listen(port, () => {
  console.log(`🚀 POS API Server running at http://localhost:${port}`);
  console.log(`🔗 WebSocket Server running at ws://localhost:${process.env.WEBSOCKET_PORT || 3001}`);
  console.log('🔐 Authentication endpoints enabled');
  console.log('📊 Enhanced sales with atomic transactions');
  console.log('🏪 Business type management enabled');
  console.log('🍽️ Kitchen orders management enabled');
  console.log('🪑 Table management enabled');
  console.log('⭐ Loyalty program enabled');
  console.log('📈 Analytics dashboard enabled');
  console.log('🖥️ Multi-terminal support enabled');
  console.log('💚 Health check endpoint: /api/health');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  console.log(`Disconnecting ${clients.size} WebSocket clients...`);

  // Close all WebSocket connections
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1000, 'Server shutting down');
    }
  });

  // Close WebSocket server
  if (wss) {
    wss.close(() => {
      console.log('WebSocket server closed');
    });
  }

  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  console.log(`Disconnecting ${clients.size} WebSocket clients...`);

  // Close all WebSocket connections
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1000, 'Server shutting down');
    }
  });

  // Close WebSocket server
  if (wss) {
    wss.close(() => {
      console.log('WebSocket server closed');
    });
  }

  await prisma.$disconnect();
  process.exit(0);
});
