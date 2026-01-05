const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up database...');

const rootDir = path.join(__dirname, '..');
const prismaPath = path.join(rootDir, 'node_modules', '.bin', 'prisma');

try {
  console.log('📦 Generating Prisma Client...');
  console.log('Using prisma at:', prismaPath);
  execSync(prismaPath + ' generate', { stdio: 'inherit', cwd: rootDir, shell: true });
  
  console.log('🗄️ Pushing schema to database...');
  execSync(prismaPath + ' db push --accept-data-loss', { stdio: 'inherit', cwd: rootDir, shell: true });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
