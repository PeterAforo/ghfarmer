const fs = require('fs');
const path = require('path');

const appRoot = process.cwd();
const prismaClientSource = path.join(appRoot, '.prisma-client');
const nodeModulesTarget = path.join(appRoot, 'node_modules');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source not found: ${src}`);
    return;
  }

  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Only run in production (on cPanel)
if (process.env.NODE_ENV === 'production' || fs.existsSync(prismaClientSource)) {
  console.log('Copying pre-built Prisma client to node_modules...');
  
  try {
    // Copy .prisma folder
    const prismaDest = path.join(nodeModulesTarget, '.prisma');
    const prismaSource = path.join(prismaClientSource, 'client');
    if (fs.existsSync(prismaSource)) {
      copyRecursive(prismaSource, path.join(prismaDest, 'client'));
      console.log('✅ Copied .prisma/client');
    }
    
    // Copy @prisma folder
    const atPrismaSource = path.join(prismaClientSource, '@prisma');
    const atPrismaDest = path.join(nodeModulesTarget, '@prisma');
    if (fs.existsSync(atPrismaSource)) {
      copyRecursive(atPrismaSource, atPrismaDest);
      console.log('✅ Copied @prisma');
    }
    
    console.log('✅ Prisma client setup complete!');
  } catch (error) {
    console.error('Error copying Prisma client:', error.message);
  }
} else {
  console.log('Skipping Prisma client copy (not in production or .prisma-client not found)');
}
