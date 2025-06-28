#!/usr/bin/env node

/**
 * Vercel Setup Helper Script
 * Guides through the Vercel deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

console.log('🚀 Vercel Deployment Setup');
console.log('==========================');
console.log('');

// Check if vercel CLI is installed
try {
  const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Vercel CLI installed: ${version}`);
} catch (error) {
  console.log('❌ Vercel CLI not found. Please run: npm install -g vercel');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('');
  console.log('❌ Not logged in to Vercel');
  console.log('📝 Please run: vercel login');
  console.log('   This will open your browser for authentication');
  console.log('');
  process.exit(1);
}

// Check if project is linked
const vercelDir = '.vercel';
if (fs.existsSync(vercelDir)) {
  console.log('✅ Project linked to Vercel');
} else {
  console.log('');
  console.log('❌ Project not linked to Vercel');
  console.log('📝 Please run: vercel link');
  console.log('   This will connect your local project to Vercel');
  console.log('');
  process.exit(1);
}

console.log('');

// Generate secure CRON_SECRET if needed
const cronSecret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Environment Variables Setup');
console.log('===============================');
console.log('');
console.log('Required environment variables for your Vercel project:');
console.log('');

const requiredVars = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://your-domain.vercel.app',
    description: 'Your actual Vercel domain'
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    description: 'Environment mode'
  },
  {
    key: 'CRON_SECRET',
    value: cronSecret,
    description: 'Generated secure random string'
  },
  {
    key: 'NEXT_PUBLIC_FORMSPREE_ID',
    value: 'your_formspree_form_id',
    description: 'For contact forms (get from formspree.io)'
  },
  {
    key: 'NEXT_PUBLIC_INSTAGRAM_TOKEN',
    value: 'your_instagram_token',
    description: 'For Instagram gallery (optional)'
  },
  {
    key: 'NEXT_PUBLIC_INSTAGRAM_HANDLE',
    value: 'nycayenmoore',
    description: 'Instagram username'
  }
];

requiredVars.forEach((env, index) => {
  console.log(`${index + 1}. ${env.key}`);
  console.log(`   Value: ${env.value}`);
  console.log(`   Purpose: ${env.description}`);
  console.log('');
});

console.log('📝 To add these to Vercel:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable above');
console.log('');

console.log('🚀 Deployment Commands:');
console.log('========================');
console.log('');
console.log('# Deploy to preview (for testing)');
console.log('vercel');
console.log('');
console.log('# Deploy to production');
console.log('vercel --prod');
console.log('');

console.log('🧪 Test Your Deployment:');
console.log('=========================');
console.log('');
console.log('# Test cron job after deployment');
console.log('npm run test:cron');
console.log('');
console.log('# Check build locally first');
console.log('npm run build');
console.log('');

console.log('✨ Your project is ready for Vercel deployment!');
console.log('');

// Save environment template with generated CRON_SECRET
const envTemplate = `# Generated Environment Variables for Vercel
# Copy these to your Vercel project dashboard

# Core Application
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production

# Security (Generated)
CRON_SECRET=${cronSecret}

# Contact Forms (Required)
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_form_id

# Instagram (Optional)
NEXT_PUBLIC_INSTAGRAM_TOKEN=your_instagram_token
NEXT_PUBLIC_INSTAGRAM_HANDLE=nycayenmoore

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
`;

fs.writeFileSync('.env.vercel.generated', envTemplate);
console.log('💾 Generated .env.vercel.generated with secure CRON_SECRET');
console.log('   Use this as reference for Vercel environment variables');
console.log('');