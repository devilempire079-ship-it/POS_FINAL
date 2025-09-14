const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignPermissionTemplates() {
  console.log('🔧 Assigning permission templates to users...\n');

  try {
    // Get all templates
    const templates = await prisma.permissionTemplate.findMany();
    console.log(`Found ${templates.length} templates`);

    // Define template assignments
    const assignments = [
      { email: 'admin@test.com', templateName: 'Super Admin' },
      { email: 'manager@test.com', templateName: 'Store Manager' },
      { email: 'cashier@test.com', templateName: 'Cashier' }
    ];

    for (const assignment of assignments) {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: assignment.email }
      });

      if (!user) {
        console.log(`❌ User ${assignment.email} not found`);
        continue;
      }

      // Find template
      const template = templates.find(t => t.name === assignment.templateName);
      if (!template) {
        console.log(`❌ Template ${assignment.templateName} not found`);
        continue;
      }

      // Assign template to user
      await prisma.user.update({
        where: { id: user.id },
        data: { permissionTemplateId: template.id }
      });

      console.log(`✅ Assigned "${assignment.templateName}" template to ${assignment.email}`);
    }

    // Verify assignments
    console.log('\n📋 Verifying assignments...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        permissionTemplate: {
          select: { name: true }
        }
      }
    });

    users.forEach(user => {
      console.log(`${user.name} (${user.email}) -> ${user.permissionTemplate?.name || 'No template'}`);
    });

    console.log('\n🎉 Permission templates assigned successfully!');

  } catch (error) {
    console.error('❌ Error assigning templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignPermissionTemplates();
