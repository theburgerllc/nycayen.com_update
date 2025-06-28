#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Run this before deploying to Vercel to ensure everything is ready
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Pre-Check\n');

const checks = [
  {
    name: 'Next.js Config',
    check: () => fs.existsSync('next.config.js'),
    success: '✅ next.config.js found',
    failure: '❌ next.config.js missing'
  },
  {
    name: 'Vercel Config',
    check: () => fs.existsSync('vercel.json'),
    success: '✅ vercel.json configured',
    failure: '❌ vercel.json missing'
  },
  {
    name: 'Package.json',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
      } catch {
        return false;
      }
    },
    success: '✅ Package.json has build scripts',
    failure: '❌ Package.json missing build scripts'
  },
  {
    name: 'Environment Template',
    check: () => fs.existsSync('.env.example'),
    success: '✅ Environment template available',
    failure: '❌ .env.example missing'
  },
  {
    name: 'Build Directory Clean',
    check: () => !fs.existsSync('.next') || fs.readdirSync('.next').length === 0,
    success: '✅ No stale build files',
    failure: '⚠️  Consider cleaning .next directory'
  },
  {
    name: 'TypeScript Check',
    check: () => {
      try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        return tsconfig.compilerOptions;
      } catch {
        return false;
      }
    },
    success: '✅ TypeScript configured',
    failure: '❌ TypeScript configuration issue'
  },
  {
    name: 'Public Assets',
    check: () => {
      const publicDir = 'public';
      if (!fs.existsSync(publicDir)) return false;
      const required = ['favicon.ico', 'site.webmanifest'];
      return required.every(file => fs.existsSync(path.join(publicDir, file)));
    },
    success: '✅ Required public assets found',
    failure: '⚠️  Some public assets missing (check DEPLOYMENT.md)'
  }
];

let allPassed = true;

checks.forEach(({ name, check, success, failure }) => {
  const passed = check();
  console.log(passed ? success : failure);
  if (!passed && !failure.includes('⚠️')) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Ready for Vercel deployment!');
  console.log('\nNext steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Import project in Vercel dashboard');
  console.log('3. Configure environment variables (see .env.example)');
  console.log('4. Deploy!');
} else {
  console.log('⚠️  Please fix the issues above before deploying');
  process.exit(1);
}

console.log('\n📖 See DEPLOYMENT.md for detailed instructions');