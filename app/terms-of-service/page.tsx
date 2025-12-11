import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Tapan Associate",
  description:
    "Terms of Service for using Tapan Associate cargo operations, including shipment handling and limited WhatsApp usage for invoices.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          <p>
            These Terms of Service ("Terms") govern your use of the cargo services
            provided by Tapan Associate ("Tapan Associate", "we", "us", or "our"),
            including our operations portal, shipment tracking tools, and related
            communication channels.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">1. Scope of services</h2>
          <p>
            Tapan Associate provides cargo and logistics services, including receiving,
            consolidating, transporting, and handing over shipments between hubs. Our
            services are primarily focused on corridors such as Imphal ⇄ New Delhi and
            any other routes that we may operate from time to time.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">2. Your responsibilities</h2>
          <p>By using our services, you agree to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Provide accurate and complete shipment and contact information.</li>
            <li>Ensure that goods comply with applicable transport and safety regulations.</li>
            <li>Not ship prohibited, dangerous, or illegal items.</li>
            <li>Pay all applicable charges and fees associated with your shipments.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">3. Accounts and access</h2>
          <p>
            Access to our internal dashboard and operations portal may be restricted to
            authorized personnel. You are responsible for maintaining the
            confidentiality of any login credentials issued to you and for all activity
            that occurs under your account.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">4. Shipments, delays, and risk</h2>
          <p>
            While we work to meet committed service levels, actual transit times can be
            affected by factors outside our control, such as airline or road network
            disruptions, weather, regulatory checks, or security constraints. Risk of
            loss or damage may be governed by separate consignment notes, airway bills,
            or contracts agreed with you.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">5. Charges and invoicing</h2>
          <p>
            Prices, surcharges, and credit terms are communicated to you through our
            operations team. We may issue digital invoices for shipments and related
            services. You agree to review invoices promptly and raise any disputes
            within a reasonable period communicated by our team.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">6. Use of WhatsApp (Meta)</h2>
          <p>
            Tapan Associate uses WhatsApp, a service provided by Meta Platforms, in a
            limited and transactional way:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              We may send you a digital copy of your shipment invoice or related
              shipment documents to the WhatsApp number you provide.
            </li>
            <li>
              We may reply to operational or support messages that you send to our
              WhatsApp number.
            </li>
            <li>
              We do <span className="font-semibold text-foreground">not</span> use WhatsApp for
              marketing campaigns, promotional broadcasts, or unrelated advertising.
            </li>
          </ul>
          <p className="mt-2">
            By sharing your WhatsApp-enabled number with us, you consent to receive
            these one-to-one, service-related communications. You can choose to receive
            invoices and updates via alternative channels (such as email or printed
            copies) by informing our operations team.
          </p>

          <p className="mt-2">
            Your use of WhatsApp is also subject to WhatsApp&apos;s own terms of service
            and privacy policy. We do not control how Meta processes data within
            WhatsApp.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">7. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Interfere with or disrupt our systems or networks.</li>
            <li>Attempt to gain unauthorized access to our dashboard or infrastructure.</li>
            <li>Misuse tracking tools or support channels for fraudulent or abusive activity.</li>
          </ul>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">8. Limitation of liability</h2>
          <p>
            To the extent permitted by applicable law, Tapan Associate is not liable for
            indirect, incidental, special, or consequential damages arising from your use
            of our digital tools or communications channels. Any liability related to
            the physical carriage of goods may be governed by separate written
            agreements, consignment notes, or carrier terms.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">9. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time, for example to reflect changes
            in our operations or applicable requirements. When we do, we will update the
            "Last updated" date at the top of this page. Continued use of our services
            after changes are published constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-lg md:text-xl font-semibold text-foreground mt-6">10. Contact</h2>
          <p>
            For questions about these Terms or our services, you can contact our
            operations team at:
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
