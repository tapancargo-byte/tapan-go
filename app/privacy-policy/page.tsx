import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Tapan Associate",
  description:
    "Learn how Tapan Associate handles shipment, billing, and contact data, including limited use of WhatsApp only for sending invoice copies and essential support.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 11, 2025";

  return (
    <main id="top" className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs md:text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          <p>
            Tapan Associate ("Tapan Associate", "we", "us", or "our") is a cargo operator
            focused on moving shipments between hubs such as Imphal and New Delhi. This
            Privacy Policy explains how we handle personal information when you interact
            with our operations portal, tracking tools, and support channels.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">1. Information we collect</h2>
          <p>We collect only the information needed to create, handle, and support shipments:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Contact details, such as name, phone number, WhatsApp number, and email address.</li>
            <li>Shipment information, such as origin and destination, contents description, weight, and value.</li>
            <li>Billing and invoice information required to issue invoices and reconcile payments.</li>
            <li>Operational logs, such as timestamps, user actions, and technical logs to secure the platform.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">2. How we use your information</h2>
          <p>We use the data we collect strictly for operational and support purposes, including to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Create and manage bookings and shipments.</li>
            <li>Generate and share invoices and other compliance documents.</li>
            <li>Provide shipment tracking and customer support.</li>
            <li>Maintain security, prevent abuse, and monitor service performance.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">3. Use of WhatsApp (Meta)</h2>
          <p>
            We use WhatsApp, a service provided by Meta Platforms, only for one-to-one,
            transactional communication that you expect as part of using our cargo
            services. In particular:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              We may send a copy of your shipment invoice or related shipment documents
              to your WhatsApp number, when you provide that number to us for this
              purpose.
            </li>
            <li>
              We may respond to support conversations that you initiate with our
              operations team over WhatsApp.
            </li>
            <li>
              We do <span className="font-semibold text-foreground">not</span> use WhatsApp for
              bulk marketing, promotional campaigns, or broadcast messaging.
            </li>
          </ul>
          <p className="mt-2">
            Your use of WhatsApp is also governed by WhatsApp&apos;s own terms of service
            and privacy policy. We do not control how Meta processes data within WhatsApp.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">4. Legal basis and purpose limitation</h2>
          <p>
            We process personal information only as needed to perform our cargo
            services, comply with our legal and tax obligations, protect our legitimate
            business interests (such as preventing fraud or abuse), and respond to your
            requests.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">5. Data sharing</h2>
          <p>
            We do not sell your personal information or share it with third parties for
            their independent marketing purposes. We may share information with:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Carriers, airlines, and logistics partners involved in delivering your shipment.</li>
            <li>Technology and infrastructure providers that host or support our systems.</li>
            <li>Payment and invoicing partners involved in processing your payments.</li>
            <li>Regulators, law enforcement, or other parties where required by applicable law.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">6. Data retention</h2>
          <p>
            We keep shipment and invoice records for as long as required by operational
            needs, customer support, and applicable accounting or tax rules. Operational
            logs may be retained for a shorter period, as needed for security,
            troubleshooting, or auditing.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">7. Your choices</h2>
          <p>You can:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Choose not to provide a WhatsApp number and receive invoices through other channels (such as email or printed copy).</li>
            <li>Contact us to correct inaccurate information related to your shipments or invoices.</li>
            <li>Request clarification about how your information is used in our operations systems.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">8. Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect personal
            information against unauthorized access, loss, or misuse. No system can be
            guaranteed to be 100% secure, but we continuously work to improve our
            safeguards.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in
            our operations or in applicable requirements. When we do, we will update
            the "Last updated" date at the top of this page. In case of significant
            changes, we may also provide additional notice through our portal.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">10. Contact us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data,
            you can reach our operations team at:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              Email: <span className="font-mono">support@tapango.logistics</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 flex justify-end">
          <a
            href="#top"
            className="inline-flex items-center text-xs md:text-sm text-muted-foreground hover:text-foreground"
          >
            Back to top
            <ArrowUp className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
