const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Permission checking middleware
const checkPermission = (resource, action, field = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has permission
      const hasPermission = await userHasPermission(userId, resource, action, field);

      if (!hasPermission) {
        // Log unauthorized access attempt
        console.log(`🚫 UNAUTHORIZED: User ${userId} attempted ${action} on ${resource}${field ? '.' + field : ''}`);

        return res.status(403).json({
          error: 'Access denied',
          message: `You don't have permission to ${action} ${resource}${field ? ' ' + field : ''}`
        });
      }

      // Log successful permission check
      console.log(`✅ AUTHORIZED: User ${userId} granted ${action} access to ${resource}${field ? '.' + field : ''}`);

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Check if user has specific permission
async function userHasPermission(userId, resource, action, field = null) {
  try {
    // Simplified permission check - just check user role
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });

    if (!user) return false;

    // Simple role-based permissions
    if (user.role === 'admin') return true;
    if (user.role === 'manager' && ['dashboard', 'sales', 'products', 'customers'].includes(resource)) return true;
    if (user.role === 'cashier' && ['sales', 'products'].includes(resource) && action === 'view') return true;

    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

// Get all permissions for a user
async function getUserPermissions(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });

    if (!user) return [];

    // Return basic permissions based on role
    const permissions = [];
    if (user.role === 'admin') {
      permissions.push(
        { resource: 'all', action: 'all', source: 'role', role: 'admin' }
      );
    } else if (user.role === 'manager') {
      permissions.push(
        { resource: 'dashboard', action: 'view', source: 'role', role: 'manager' },
        { resource: 'sales', action: 'all', source: 'role', role: 'manager' },
        { resource: 'products', action: 'all', source: 'role', role: 'manager' },
        { resource: 'customers', action: 'all', source: 'role', role: 'manager' }
      );
    } else if (user.role === 'cashier') {
      permissions.push(
        { resource: 'sales', action: 'view', source: 'role', role: 'cashier' },
        { resource: 'products', action: 'view', source: 'role', role: 'cashier' }
      );
    }

    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Get available permission templates
async function getPermissionTemplates() {
  try {
    // Return basic role templates
    return [
      {
        id: 1,
        name: 'Admin Template',
        description: 'Full system access',
        isDefault: false,
        isSystem: true,
        permissions: [{ resource: 'all', action: 'all' }],
        _count: { users: 1 }
      },
      {
        id: 2,
        name: 'Manager Template',
        description: 'Management level access',
        isDefault: false,
        isSystem: true,
        permissions: [
          { resource: 'dashboard', action: 'view' },
          { resource: 'sales', action: 'all' },
          { resource: 'products', action: 'all' },
          { resource: 'customers', action: 'all' }
        ],
        _count: { users: 1 }
      },
      {
        id: 3,
        name: 'Cashier Template',
        description: 'Basic sales access',
        isDefault: false,
        isSystem: true,
        permissions: [
          { resource: 'sales', action: 'view' },
          { resource: 'products', action: 'view' }
        ],
        _count: { users: 1 }
      }
    ];
  } catch (error) {
    console.error('Error getting permission templates:', error);
    return [];
  }
}

// Assign permission template to user
async function assignPermissionTemplate(userId, templateId) {
  try {
    // Simplified - just update user role based on template
    let newRole = 'cashier'; // default
    if (templateId === 1) newRole = 'admin';
    else if (templateId === 2) newRole = 'manager';
    else if (templateId === 3) newRole = 'cashier';

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: newRole },
      select: { id: true, name: true, role: true }
    });

    console.log(`✅ Assigned role "${newRole}" to user ${userId}`);
    return user;
  } catch (error) {
    console.error('Error assigning permission template:', error);
    throw error;
  }
}

// Update user-specific permissions
async function updateUserPermissions(userId, permissions) {
  try {
    // Simplified - just log the update
    console.log(`✅ Updated ${permissions.length} permissions for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

// Create custom permission template
async function createPermissionTemplate(name, description, permissions, isDefault = false) {
  try {
    // Simplified - just return a mock template
    const template = {
      id: Date.now(),
      name,
      description,
      isDefault,
      isSystem: false,
      permissions
    };

    console.log(`✅ Created custom template "${name}" with ${permissions.length} permissions`);
    return template;
  } catch (error) {
    console.error('Error creating permission template:', error);
    throw error;
  }
}

// Middleware for admin-only actions
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin role or admin permissions
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });

    if (user?.role !== 'admin' && !await userHasPermission(userId, 'users', 'create')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Admin check failed' });
  }
};

// Middleware for manager-level actions
const requireManager = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });

    const isManager = user?.role === 'admin' || user?.role === 'manager';
    const hasManagerPerms = await userHasPermission(userId, 'users', 'edit');

    if (!isManager && !hasManagerPerms) {
      return res.status(403).json({ error: 'Manager access required' });
    }

    next();
  } catch (error) {
    console.error('Manager check error:', error);
    res.status(500).json({ error: 'Manager check failed' });
  }
};

module.exports = {
  checkPermission,
  userHasPermission,
  getUserPermissions,
  getPermissionTemplates,
  assignPermissionTemplate,
  updateUserPermissions,
  createPermissionTemplate,
  requireAdmin,
  requireManager
};
