const { execSync } = require('child_process');

console.log('🔧 Setting up database...');

try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🗄️ Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
