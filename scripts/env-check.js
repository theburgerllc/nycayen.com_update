#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Analyzes current environment setup and identifies missing variables
 */

const fs = require('fs');
const crypto = require('crypto');

console.log('🔍 Environment Variables Check');
console.log('==============================');
console.log('');

// Load environment files
const envFiles = [
  '.env.local',
  '.env.production', 
  '.vercel/.env.production.local'
];

const allVars = new Map();

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📁 Found: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^"(.*)"$/, '$1');
          allVars.set(key.trim(), value.trim());
        }
      }
    });
  }
});

console.log('');

// Required variables for basic functionality
const requiredVars = {
  // Core application
  'NODE_ENV': { 
    required: true, 
    description: 'Environment mode',
    current: allVars.get('NODE_ENV')
  },
  'NEXT_PUBLIC_SITE_URL': { 
    required: true, 
    description: 'Your actual Vercel domain',
    current: allVars.get('NEXT_PUBLIC_SITE_URL'),
    placeholder: 'https://your-domain.vercel.app'
  },
  
  // Cron job security
  'CRON_SECRET': {
    required: true,
    description: 'Security token for cron jobs',
    current: allVars.get('CRON_SECRET'),
    generate: () => crypto.randomBytes(32).toString('hex')
  },
  
  // Contact forms
  'NEXT_PUBLIC_FORMSPREE_ID': {
    required: true,
    description: 'Formspree form ID for contact forms',
    current: allVars.get('NEXT_PUBLIC_FORMSPREE_ID'),
    fallback: allVars.get('FORMSPREE_FORM_ID')
  },
  
  // Instagram integration  
  'NEXT_PUBLIC_INSTAGRAM_TOKEN': {
    required: false,
    description: 'Instagram Basic Display API token',
    current: allVars.get('NEXT_PUBLIC_INSTAGRAM_TOKEN')
  },
  'NEXT_PUBLIC_INSTAGRAM_HANDLE': {
    required: false,
    description: 'Instagram username to display',
    current: allVars.get('NEXT_PUBLIC_INSTAGRAM_HANDLE'),
    placeholder: 'nycayenmoore'
  },
  
  // Analytics
  'NEXT_PUBLIC_GA_ID': {
    required: false,
    description: 'Google Analytics tracking ID',
    current: allVars.get('NEXT_PUBLIC_GA_ID') || allVars.get('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID')
  }
};

console.log('📊 Environment Variables Status:');
console.log('=================================');
console.log('');

const missingRequired = [];
const needsUpdate = [];
const configured = [];

Object.entries(requiredVars).forEach(([key, config]) => {
  const value = config.current || config.fallback;
  const status = value ? '✅' : (config.required ? '❌' : '⚠️ ');
  
  console.log(`${status} ${key}`);
  console.log(`   Purpose: ${config.description}`);
  
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY') 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`   Current: ${displayValue}`);
    configured.push(key);
  } else {
    if (config.required) {
      missingRequired.push(key);
      if (config.generate) {
        const generated = config.generate();
        console.log(`   💡 Generated: ${generated.substring(0, 16)}...`);
      } else if (config.placeholder) {
        console.log(`   📝 Example: ${config.placeholder}`);
      }
    } else {
      needsUpdate.push(key);
      if (config.placeholder) {
        console.log(`   📝 Example: ${config.placeholder}`);
      }
    }
  }
  console.log('');
});

// Summary
console.log('📋 Summary:');
console.log('===========');
console.log(`✅ Configured: ${configured.length}`);
console.log(`❌ Missing Required: ${missingRequired.length}`);
console.log(`⚠️  Optional Missing: ${needsUpdate.length}`);
console.log('');

if (missingRequired.length > 0) {
  console.log('🚨 Action Required:');
  console.log('Add these to Vercel environment variables:');
  console.log('');
  
  missingRequired.forEach(key => {
    const config = requiredVars[key];
    if (config.generate) {
      console.log(`${key}=${config.generate()}`);
    } else {
      console.log(`${key}=${config.placeholder || 'your_value_here'}`);
    }
  });
  console.log('');
}

if (needsUpdate.length > 0) {
  console.log('💡 Optional Enhancements:');
  needsUpdate.forEach(key => {
    const config = requiredVars[key];
    console.log(`- ${key}: ${config.description}`);
  });
  console.log('');
}

// Check for common issues
console.log('🔍 Configuration Checks:');
console.log('========================');

const siteUrl = allVars.get('NEXT_PUBLIC_SITE_URL');
if (siteUrl && siteUrl.includes('placeholder')) {
  console.log('⚠️  NEXT_PUBLIC_SITE_URL contains placeholder - update with actual domain');
}

const nextAuthUrl = allVars.get('NEXTAUTH_URL');
if (nextAuthUrl && nextAuthUrl.includes('placeholder')) {
  console.log('⚠️  NEXTAUTH_URL contains placeholder - update with actual domain');
}

const formspreeId = allVars.get('NEXT_PUBLIC_FORMSPREE_ID') || allVars.get('FORMSPREE_FORM_ID');
if (formspreeId && formspreeId.includes('formspree.io')) {
  console.log('✅ Formspree configured with full URL');
} else if (formspreeId) {
  console.log('💡 Consider using full Formspree URL format');
}

console.log('');
console.log('🚀 Next Steps:');
console.log('==============');
console.log('1. Update missing variables in Vercel dashboard');
console.log('2. Replace placeholder values with actual domains');
console.log('3. Test deployment: vercel --prod');
console.log('4. Verify cron job: npm run test:cron');
console.log('');