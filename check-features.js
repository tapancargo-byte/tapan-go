#!/usr/bin/env node

/**
 * Feature Status Checker
 * 
 * Run: node check-features.js
 * Or: npm run check:features
 */

const fs = require('fs');
const path = require('path');

// Check if a package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

// Check environment variables
function hasEnvVar(varName) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return false;
  
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    return content.includes(varName);
  } catch {
    return false;
  }
}

// Print status
function printStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TAPAN GO - FEATURE STATUS');
  console.log('='.repeat(60) + '\n');

  // Core features (always available)
  console.log('✅ CORE FEATURES (Always Available):\n');
  
  const coreFeatures = [
    'Authentication & Authorization (RBAC, RLS)',
    'Modern UI Components (Glass cards, animations)',
    'Advanced Data Tables (Sort, filter, export)',
    'Real-time Updates (Live shipment tracking)',
    'Public Tracking Page (No login required)',
  ];
  
  coreFeatures.forEach(feature => {
    console.log(`  ✓ ${feature}`);
  });
  
  console.log();

  // Optional features
  console.log('🔧 OPTIONAL FEATURES:\n');
  
  const optionalFeatures = [
    {
      name: 'Background Job Queue',
      packages: ['bullmq', 'ioredis'],
      env: ['REDIS_URL'],
      description: 'Async PDF generation & notifications',
      installCmd: 'npm install bullmq ioredis',
    },
    {
      name: 'Rate Limiting',
      packages: ['@upstash/ratelimit', '@upstash/redis'],
      env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
      description: 'API throttling & abuse protection',
      installCmd: 'npm install @upstash/ratelimit @upstash/redis',
    },
    {
      name: 'WhatsApp Notifications',
      packages: ['twilio'],
      env: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
      description: 'Automated customer notifications',
      installCmd: 'npm install twilio',
    },
  ];
  
  const missingFeatures = [];
  
  optionalFeatures.forEach(feature => {
    const packagesInstalled = feature.packages.every(isPackageInstalled);
    const envConfigured = feature.env.every(hasEnvVar);
    
    let status = '✓ READY';
    let icon = '✅';
    let notes = [];
    
    if (!packagesInstalled) {
      status = '✗ NOT INSTALLED';
      icon = '⚠️ ';
      notes.push(`Run: ${feature.installCmd}`);
      missingFeatures.push(feature);
    } else if (!envConfigured) {
      status = '⚠️  INSTALLED (needs config)';
      icon = '📝';
      notes.push(`Add to .env.local: ${feature.env.join(', ')}`);
    }
    
    console.log(`  ${icon} ${feature.name}: ${status}`);
    console.log(`     ${feature.description}`);
    
    notes.forEach(note => {
      console.log(`     ${note}`);
    });
    
    console.log();
  });

  // Summary
  console.log('='.repeat(60));
  
  if (missingFeatures.length === 0) {
    console.log('🎉 All optional features installed!');
    console.log('   Configure environment variables to enable them.');
  } else {
    console.log(`💡 ${missingFeatures.length} optional feature(s) not installed.`);
    console.log('   Core features work without them. Install as needed.');
    console.log();
    console.log('   Install all: npm run install:optional');
  }
  
  console.log('='.repeat(60) + '\n');
  
  console.log('📚 Documentation:');
  console.log('   • INSTALL.md - Complete installation guide');
  console.log('   • LAUNCH.md - Quick start instructions');
  console.log('   • START_HERE.md - Overview of features\n');
}

// Run
printStatus();
