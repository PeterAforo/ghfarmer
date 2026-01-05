const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up database...');

const prismaPath = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

try {
  console.log('📦 Generating Prisma Client...');
  execSync(`"${prismaPath}" generate`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log('🗄️ Pushing schema to database...');
  execSync(`"${prismaPath}" db push --accept-data-loss`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
