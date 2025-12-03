/**
 * Feature Availability Checker
 * 
 * This file checks which optional features are available
 * and provides helpful information about missing dependencies.
 */

import { queueSystemAvailable } from "./queues/setup";
import { rateLimitingAvailable } from "./rateLimit";

export interface FeatureStatus {
  name: string;
  available: boolean;
  packages: string[];
  description: string;
  installCommand: string;
}

/**
 * Get status of all optional features
 */
export function getFeatureStatus(): Record<string, FeatureStatus> {
  // Check if Twilio is available
  const twilioAvailable = !!process.env.TWILIO_ACCOUNT_SID;
  
  return {
    backgroundJobs: {
      name: "Background Job Queue",
      available: queueSystemAvailable,
      packages: ["bullmq", "ioredis"],
      description: "Async processing for PDFs, emails, and notifications",
      installCommand: "npm install bullmq ioredis",
    },
    rateLimiting: {
      name: "Rate Limiting",
      available: rateLimitingAvailable,
      packages: ["@upstash/ratelimit", "@upstash/redis"],
      description: "API request throttling and abuse protection",
      installCommand: "npm install @upstash/ratelimit @upstash/redis",
    },
    whatsapp: {
      name: "WhatsApp Notifications",
      available: twilioAvailable,
      packages: ["twilio"],
      description: "Automated customer notifications via WhatsApp",
      installCommand: "npm install twilio",
    },
  };
}

/**
 * Get list of missing features
 */
export function getMissingFeatures(): FeatureStatus[] {
  const features = getFeatureStatus();
  return Object.values(features).filter((f) => !f.available);
}

/**
 * Check if all optional features are installed
 */
export function allFeaturesAvailable(): boolean {
  const features = getFeatureStatus();
  return Object.values(features).every((f) => f.available);
}

/**
 * Get core features status (always available)
 */
export function getCoreFeatures() {
  return {
    authentication: {
      name: "Authentication & Authorization",
      available: true,
      description: "RBAC, RLS policies, auth middleware",
    },
    modernUI: {
      name: "Modern UI Components",
      available: true,
      description: "Glass cards, animations, advanced tables",
    },
    realtime: {
      name: "Real-time Updates",
      available: true,
      description: "Live shipment updates and presence detection",
    },
    publicTracking: {
      name: "Public Tracking Page",
      available: true,
      description: "Customer tracking without login",
    },
  };
}

/**
 * Print feature status to console
 */
export function printFeatureStatus(): void {
  console.log("\n" + "=".repeat(60));
  console.log("📊 TAPAN GO - FEATURE STATUS");
  console.log("=".repeat(60) + "\n");

  console.log("✅ CORE FEATURES (Always Available):\n");
  const coreFeatures = getCoreFeatures();
  Object.values(coreFeatures).forEach((feature) => {
    console.log(`  ✓ ${feature.name}`);
    console.log(`    ${feature.description}\n`);
  });

  console.log("🔧 OPTIONAL FEATURES:\n");
  const features = getFeatureStatus();
  Object.values(features).forEach((feature) => {
    const status = feature.available ? "✓ AVAILABLE" : "✗ NOT INSTALLED";
    const icon = feature.available ? "✅" : "⚠️ ";
    
    console.log(`  ${icon} ${feature.name}: ${status}`);
    console.log(`    ${feature.description}`);
    
    if (!feature.available) {
      console.log(`    Install: ${feature.installCommand}`);
    }
    console.log();
  });

  const missingCount = getMissingFeatures().length;
  
  if (missingCount === 0) {
    console.log("🎉 All features available! You're ready for production!\n");
  } else {
    console.log(`💡 ${missingCount} optional feature${missingCount > 1 ? "s" : ""} not installed.`);
    console.log("   Core features work without them. Install as needed.\n");
  }

  console.log("=".repeat(60) + "\n");
}

/**
 * Get installation instructions for missing features
 */
export function getInstallationInstructions(): string {
  const missing = getMissingFeatures();
  
  if (missing.length === 0) {
    return "✅ All optional features are installed!";
  }

  let instructions = "📦 To install missing features:\n\n";
  
  missing.forEach((feature) => {
    instructions += `# ${feature.name}\n`;
    instructions += `${feature.installCommand}\n\n`;
  });

  instructions += "Or install all at once:\n";
  instructions += `npm install ${missing.map(f => f.packages.join(" ")).join(" ")}\n`;

  return instructions;
}
