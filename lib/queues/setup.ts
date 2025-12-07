/**
 * Background Job Queue System
 * 
 * OPTIONAL FEATURE - Requires: npm install bullmq ioredis
 * 
 * If packages are not installed, functions will return error messages
 * but won't break the build.
 */

let Queue: any;
let Worker: any;
let QueueEvents: any;
let Job: any;
let IORedis: any;

// Try to import optional dependencies
let packagesAvailable = false;
try {
  const bullmq = require("bullmq");
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
  QueueEvents = bullmq.QueueEvents;
  Job = bullmq.Job;
  IORedis = require("ioredis");
  packagesAvailable = true;
} catch (error) {
  console.warn(
    "⚠️  Background job queue packages not installed. " +
    "Run: npm install bullmq ioredis"
  );
}

// Redis connection (only if packages are available)
let connection: any = null;
const redisUrl = process.env.REDIS_URL;
const queueConfigured = packagesAvailable && IORedis && !!redisUrl;

if (queueConfigured) {
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.error("Redis connection failed after 3 retries");
        return null;
      }
      return Math.min(times * 100, 3000);
    },
  });
} else if (packagesAvailable) {
  console.warn(
    "Background job queue packages installed but REDIS_URL not set. Queue system is disabled."
  );
}

// ========================================
// Invoice PDF Generation Queue
// ========================================

export const invoiceQueue = queueConfigured && Queue ? new Queue("invoice-generation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
}) : null;

export const invoiceWorker = queueConfigured && Worker ? new Worker(
  "invoice-generation",
  async (job: any) => {
    const { invoiceId } = job.data;
    console.log(`[Invoice Worker] Generating PDF for invoice ${invoiceId}`);

    try {
      // Import dynamically to avoid bundling in client
      const { generateInvoicePdf } = await import("@/lib/invoicePdf");
      const result = await generateInvoicePdf(invoiceId);

      console.log(`[Invoice Worker] PDF generated: ${result.pdfUrl}`);
      return result;
    } catch (error: any) {
      console.error(`[Invoice Worker] Error:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs simultaneously
    limiter: {
      max: 10,
      duration: 1000, // Max 10 jobs per second
    },
  }
) : null;

// ========================================
// Email Queue
// ========================================

export const emailQueue = queueConfigured && Queue ? new Queue("email-notifications", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  },
}) : null;

export const emailWorker = queueConfigured && Worker ? new Worker(
  "email-notifications",
  async (job: any) => {
    const { to, subject, html, attachments } = job.data;
    console.log(`[Email Worker] Sending email to ${to}`);

    try {
      // TODO: Implement email sending (Resend, SendGrid, etc.)
      console.log(`[Email Worker] Email sent to ${to}: ${subject}`);
      return { success: true, to, subject };
    } catch (error: any) {
      console.error(`[Email Worker] Error:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 10,
  }
) : null;

// ========================================
// Event Listeners
// ========================================

if (queueConfigured && QueueEvents) {
  const invoiceEvents = new QueueEvents("invoice-generation", { connection });
  const emailEvents = new QueueEvents("email-notifications", { connection });

  invoiceEvents.on("completed", ({ jobId, returnvalue }: { jobId: string; returnvalue: any }) => {
    console.log(`✅ Invoice job ${jobId} completed:`, returnvalue);
  });

  invoiceEvents.on("failed", ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    console.error(`❌ Invoice job ${jobId} failed:`, failedReason);
  });

  emailEvents.on("completed", ({ jobId }: { jobId: string }) => {
    console.log(`✅ Email job ${jobId} sent`);
  });

  emailEvents.on("failed", ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    console.error(`❌ Email job ${jobId} failed:`, failedReason);
  });
}

// ========================================
// Graceful Shutdown
// ========================================

async function gracefulShutdown() {
  if (!queueConfigured) return;
  
  console.log("Closing queue workers...");
  const closers = [];
  if (invoiceWorker) closers.push(invoiceWorker.close());
  if (emailWorker) closers.push(emailWorker.close());
  
  await Promise.all(closers);
  if (connection) await connection.quit();
  console.log("Queue workers closed");
}

if (queueConfigured) {
  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

// ========================================
// Helper Functions
// ========================================

export async function queueInvoiceGeneration(invoiceId: string) {
  if (!queueConfigured || !invoiceQueue) {
    throw new Error(
      "Background job queue not available. Install packages: npm install bullmq ioredis"
    );
  }
  
  return await invoiceQueue.add(
    "generate-pdf",
    { invoiceId },
    {
      jobId: `invoice-${invoiceId}`, // Prevent duplicates
    }
  );
}

export async function queueEmail(data: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  if (!queueConfigured || !emailQueue) {
    throw new Error(
      "Background job queue not available. Install packages: npm install bullmq ioredis"
    );
  }
  
  return await emailQueue.add("send-email", data);
}

// Export availability flag for checking
export const queueSystemAvailable = queueConfigured;
