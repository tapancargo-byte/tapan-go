#!/usr/bin/env node

/**
 * Tapan Go Production Upgrade - Installation Script
 * 
 * This script will guide you through setting up the production upgrades
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Check if a package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Main installation function
async function install() {
  header('🚀 Tapan Go Production Upgrade - Installation');

  log('This script will help you set up the production upgrades.\n');

  // Step 1: Check required dependencies
  header('Step 1: Checking Dependencies');

  const requiredDeps = [
    { name: '@tanstack/react-table', required: true },
    { name: '@tanstack/react-query', required: true },
  ];

  const optionalDeps = [
    { name: 'bullmq', feature: 'Background Job Queue' },
    { name: 'ioredis', feature: 'Redis Connection' },
    { name: '@upstash/ratelimit', feature: 'Rate Limiting' },
    { name: '@upstash/redis', feature: 'Upstash Redis' },
    { name: 'twilio', feature: 'WhatsApp Notifications' },
  ];

  const missingRequired = [];
  const missingOptional = [];

  // Check required
  log('Required Dependencies:', colors.bright);
  for (const dep of requiredDeps) {
    if (isPackageInstalled(dep.name)) {
      success(`${dep.name} - Installed`);
    } else {
      error(`${dep.name} - Missing`);
      missingRequired.push(dep.name);
    }
  }

  // Check optional
  log('\nOptional Dependencies:', colors.bright);
  for (const dep of optionalDeps) {
    if (isPackageInstalled(dep.name)) {
      success(`${dep.name} (${dep.feature}) - Installed`);
    } else {
      warning(`${dep.name} (${dep.feature}) - Not installed`);
      missingOptional.push({ name: dep.name, feature: dep.feature });
    }
  }

  // Step 2: Install missing packages
  if (missingRequired.length > 0) {
    header('Step 2: Installing Required Dependencies');
    
    const installCmd = `npm install ${missingRequired.join(' ')}`;
    log(`Running: ${installCmd}\n`, colors.cyan);
    
    try {
      execSync(installCmd, { stdio: 'inherit' });
      success('Required dependencies installed successfully!');
    } catch (err) {
      error('Failed to install required dependencies');
      error('Please run manually: ' + installCmd);
      process.exit(1);
    }
  } else {
    success('\n✅ All required dependencies are installed!');
  }

  // Step 3: Optional dependencies
  if (missingOptional.length > 0) {
    header('Step 3: Optional Dependencies');
    
    log('The following optional features are available:\n');
    missingOptional.forEach(dep => {
      info(`  • ${dep.name} - ${dep.feature}`);
    });
    
    log('\nTo enable these features, run:', colors.bright);
    log(`  npm install ${missingOptional.map(d => d.name).join(' ')}`, colors.cyan);
    log('\nSee FINAL_IMPLEMENTATION_GUIDE.md for details on each feature.\n');
  }

  // Step 4: Check files
  header('Step 4: Verifying Installation Files');

  const criticalFiles = [
    'middleware.ts',
    'lib/auth.ts',
    'lib/api/withAuth.ts',
    'lib/api/withValidation.ts',
    'components/ui/glass-card.tsx',
    'components/ui/advanced-table.tsx',
    'hooks/useRealtimeShipments.ts',
    'app/track/[awb]/page.tsx',
    'supabase/migrations/20251201_add_role_and_rls.sql',
  ];

  let allFilesPresent = true;
  for (const file of criticalFiles) {
    if (fileExists(file)) {
      success(`${file}`);
    } else {
      error(`${file} - Missing!`);
      allFilesPresent = false;
    }
  }

  if (!allFilesPresent) {
    error('\nSome files are missing! Implementation may be incomplete.');
  }

  // Step 5: Environment variables
  header('Step 5: Environment Variables');

  const envFile = '.env.local';
  const envExists = fileExists(envFile);

  if (envExists) {
    success('.env.local file exists');
    log('\nMake sure you have these variables set:', colors.bright);
  } else {
    warning('.env.local file not found');
    log('\nCreate .env.local with these variables:', colors.bright);
  }

  log(`
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (for background jobs)
REDIS_URL=redis://localhost:6379

# Optional (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Optional (for WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
`, colors.cyan);

  // Step 6: Database setup
  header('Step 6: Database Setup');

  log('Next, you need to run the database migration:', colors.bright);
  log('\n1. Open Supabase SQL Editor');
  log('2. Copy the contents of: supabase/migrations/20251201_add_role_and_rls.sql');
  log('3. Execute the SQL');
  log('4. Set your admin user:\n');
  log(`   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`, colors.cyan);

  // Step 7: Next steps
  header('🎉 Installation Complete!');

  success('Core dependencies installed and verified!');
  
  log('\nNext Steps:\n', colors.bright);
  log('1. Set up environment variables (.env.local)');
  log('2. Run database migration in Supabase');
  log('3. Set your admin user');
  log('4. Start the dev server: npm run dev');
  log('5. Test by visiting: http://localhost:3000/admin\n');

  log('📚 Documentation:', colors.bright);
  log('  • START_HERE.md - Quick overview');
  log('  • FINAL_IMPLEMENTATION_GUIDE.md - Complete setup guide');
  log('  • USAGE_EXAMPLES.md - Code examples\n');

  info('For detailed instructions, see: FINAL_IMPLEMENTATION_GUIDE.md');
  
  log('\n' + '='.repeat(60));
  success('Ready to launch! 🚀');
  log('='.repeat(60) + '\n');
}

// Run installation
install().catch(err => {
  error('Installation failed: ' + err.message);
  process.exit(1);
});
