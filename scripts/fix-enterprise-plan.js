const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    const result = await prisma.subscriptionPlan.update({
      where: { slug: 'enterprise' },
      data: { targetAudience: 'FARMER' }
    });
    console.log('Updated Enterprise plan:', result.name, '-> targetAudience:', result.targetAudience);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
