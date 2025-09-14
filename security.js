const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, param, query, validationResult } = require('express-validator');

// Environment validation
const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Validate JWT secrets are not default values
  if (process.env.JWT_SECRET === 'your-super-secure-jwt-secret-change-this-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Please change this in production!');
  }
};

// Generate secure secrets
const generateSecureSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// JWT token management
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m' // Short-lived access tokens
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || generateSecureSecret(),
    expiresIn: '7d' // Long-lived refresh tokens
  }
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, type = 'access') => {
  try {
    const secret = type === 'refresh' ? jwtConfig.refreshToken.secret : jwtConfig.accessToken.secret;
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

// Password security
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Rate limiting
const createRateLimiters = () => {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    message: {
      error: 'Too many login attempts',
      message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    skip: (req) => req.ip === '127.0.0.1' // Skip localhost for development
  });

  const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  return { authLimiter, apiLimiter };
};

// Input validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateCustomerSearch = [
  query('query')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s@._-]+$/)
    .withMessage('Search query contains invalid characters')
];

const validateProductSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s@._-]+$/)
    .withMessage('Search query contains invalid characters')
];

const validateCustomerCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name contains invalid characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name contains invalid characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitization functions
const sanitizeInput = (input, type) => {
  if (!input) return input;

  const sanitized = input.trim();

  switch (type) {
    case 'email':
      return sanitized.toLowerCase();
    case 'name':
      return sanitized.replace(/[^a-zA-Z\s'-]/g, '');
    case 'search':
      return sanitized.replace(/[^\w\s@._-]/g, '');
    case 'phone':
      return sanitized.replace(/[^\d+\-\s()]/g, '');
    default:
      return sanitized;
  }
};

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      process.env.ALLOWED_ORIGIN,
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000'  // Production build
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS policy: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-terminal-id'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Brute force protection
const loginAttempts = new Map();

const checkBruteForce = (identifier) => {
  const attempts = loginAttempts.get(identifier) || 0;
  if (attempts >= 5) {
    throw new Error('Account temporarily locked due to multiple failed attempts');
  }
  return attempts;
};

const recordFailedAttempt = (identifier) => {
  const attempts = loginAttempts.get(identifier) || 0;
  loginAttempts.set(identifier, attempts + 1);

  // Clear attempts after 15 minutes
  setTimeout(() => {
    loginAttempts.delete(identifier);
  }, 15 * 60 * 1000);
};

const clearFailedAttempts = (identifier) => {
  loginAttempts.delete(identifier);
};

// Audit logging
const auditLog = (action, userId, resource, resourceId, details, req) => {
  if (!process.env.ENABLE_AUDIT_LOG) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent')
  };

  console.log('🔍 AUDIT:', JSON.stringify(logEntry, null, 2));
};

module.exports = {
  validateEnvironment,
  generateSecureSecret,
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
};
