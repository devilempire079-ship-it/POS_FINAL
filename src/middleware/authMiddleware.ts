import jwt from "jsonwebtoken";

/**
 * JWT Authentication Middleware
 * Extracts user info from JWT token and attaches to req.user
 */
export function authMiddleware(req: any, res: any, next: Function) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      businessType: decoded.businessType,
      role: decoded.role || 'user'
    };

    next();
  } catch (error: any) {
    console.error('JWT verification failed:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(403).json({ error: 'Invalid token' });
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(roles: string[]) {
  return (req: any, res: any, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Pre-built role middlewares
export const requireAdmin = requireRole(['admin']);
export const requireManager = requireRole(['admin', 'manager']);
export default authMiddleware;
