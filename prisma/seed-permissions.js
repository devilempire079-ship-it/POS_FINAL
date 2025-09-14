const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBasicTemplates() {
  console.log('🔐 Creating Basic Permission Templates...\n');

  // Create basic templates without field-level permissions to avoid memory issues
  const templates = [
    {
      name: 'Super Admin',
      description: 'Full access to all features and functions',
      isSystem: true,
      isDefault: false
    },
    {
      name: 'Store Manager',
      description: 'Management access with some restrictions',
      isSystem: true,
      isDefault: true
    },
    {
      name: 'Cashier',
      description: 'Basic sales and customer service access',
      isSystem: true,
      isDefault: true
    },
    {
      name: 'Inventory Clerk',
      description: 'Inventory management focused role',
      isSystem: true,
      isDefault: false
    },
    {
      name: 'Read Only',
      description: 'View-only access to most features',
      isSystem: true,
      isDefault: false
    }
  ];

  // Basic permissions for each template (resource + action level only)
  const templatePermissions = {
    'Super Admin': [
      // All resources with all actions
      { resource: 'dashboard', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'sales', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'inventory', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'reports', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'settings', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'loyalty', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'suppliers', actions: ['view', 'create', 'edit', 'delete', 'export'] }
    ],
    'Store Manager': [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'sales', actions: ['view', 'create', 'edit', 'export'] }, // No delete
      { resource: 'customers', actions: ['view', 'create', 'edit', 'export'] }, // No delete
      { resource: 'products', actions: ['view', 'create', 'edit', 'export'] }, // No delete
      { resource: 'inventory', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'reports', actions: ['view', 'export'] },
      { resource: 'loyalty', actions: ['view', 'create', 'edit'] }, // No delete
      { resource: 'suppliers', actions: ['view'] },
      { resource: 'settings', actions: ['view'] }
    ],
    'Cashier': [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'sales', actions: ['view', 'create'] }, // No edit/delete
      { resource: 'customers', actions: ['view', 'create'] }, // No edit/delete
      { resource: 'products', actions: ['view'] }, // View only
      { resource: 'inventory', actions: ['view'] }, // View only
      { resource: 'loyalty', actions: ['view', 'create'] } // Can earn points
    ],
    'Inventory Clerk': [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'products', actions: ['view', 'create', 'edit'] }, // No delete
      { resource: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'suppliers', actions: ['view', 'create', 'edit'] },
      { resource: 'reports', actions: ['view'] }
    ],
    'Read Only': [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'sales', actions: ['view'] },
      { resource: 'customers', actions: ['view'] },
      { resource: 'products', actions: ['view'] },
      { resource: 'inventory', actions: ['view'] },
      { resource: 'reports', actions: ['view'] },
      { resource: 'loyalty', actions: ['view'] },
      { resource: 'suppliers', actions: ['view'] },
      { resource: 'settings', actions: ['view'] }
    ]
  };

  // Create templates and their permissions
  for (const templateData of templates) {
    console.log(`📝 Creating template: ${templateData.name}`);

    const template = await prisma.permissionTemplate.create({
      data: {
        name: templateData.name,
        description: templateData.description,
        isDefault: templateData.isDefault,
        isSystem: templateData.isSystem
      }
    });

    // Create permissions for this template
    const permissions = templatePermissions[templateData.name] || [];
    let permissionCount = 0;

    for (const perm of permissions) {
      for (const action of perm.actions) {
        await prisma.templatePermission.create({
          data: {
            templateId: template.id,
            resource: perm.resource,
            action: action,
            field: null, // No field-level for basic setup
            allowed: true
          }
        });
        permissionCount++;
      }
    }

    console.log(`   ✅ Created ${permissionCount} permissions`);
  }

  console.log('\n🎉 Basic permission templates created successfully!');
  console.log('\n📋 Available Templates:');
  console.log('   • Super Admin - Full access to everything');
  console.log('   • Store Manager - Management with some restrictions');
  console.log('   • Cashier - Basic sales operations');
  console.log('   • Inventory Clerk - Inventory management focus');
  console.log('   • Read Only - View-only access');
  console.log('\n💡 Note: Field-level permissions can be added later through the admin interface');
}

async function main() {
  try {
    await createBasicTemplates();
  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
