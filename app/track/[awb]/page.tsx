import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { TrackingHeader } from "@/components/tracking/tracking-header";
import { TrackingMap } from "@/components/tracking/tracking-map";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { FadeIn } from "@/components/ui/animated-card";
import { BrandLogo } from "@/components/ui/brand-logo";

interface PageProps {
  params: {
    awb: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { awb } = params;
  
  return {
    title: `Track Shipment ${awb} | Tapan Go`,
    description: `Real-time tracking for shipment ${awb}`,
    openGraph: {
      title: `Track Shipment ${awb}`,
      description: "Track your shipment in real-time",
      type: "website",
    },
  };
}

async function getShipmentData(awb: string) {
  // Fetch shipment details
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from("shipments")
    .select(`
      *,
      customers (
        id,
        name,
        email,
        phone
      ),
      barcodes (
        id,
        barcode_number,
        status,
        last_scanned_at,
        last_scanned_location
      )
    `)
    .or(`shipment_ref.eq.${awb},id.eq.${awb}`)
    .maybeSingle();

  if (shipmentError || !shipment) {
    return null;
  }

  // Fetch scan history
  const { data: scans } = await supabaseAdmin
    .from("package_scans")
    .select("*")
    .in(
      "barcode_id",
      shipment.barcodes?.map((b: any) => b.id) || []
    )
    .order("scanned_at", { ascending: true });

  return {
    shipment,
    scans: scans || [],
  };
}

export default async function TrackingPage({ params }: PageProps) {
  const { awb } = params;
  const data = await getShipmentData(awb);

  if (!data) {
    notFound();
  }

  const { shipment, scans } = data;

  // Build timeline events from scans
  const timelineEvents = [
    {
      status: "created",
      location: shipment.origin,
      timestamp: shipment.created_at,
      description: "Shipment created",
      completed: true,
    },
    ...scans.map((scan: any) => ({
      status: scan.status,
      location: scan.location || "Unknown",
      timestamp: scan.scanned_at,
      description: scan.notes || `Scanned at ${scan.location}`,
      completed: true,
    })),
    {
      status: "out-for-delivery",
      location: shipment.destination,
      timestamp: null,
      description: "Out for delivery",
      completed: shipment.status === "out-for-delivery" || shipment.status === "delivered",
    },
    {
      status: "delivered",
      location: shipment.destination,
      timestamp: shipment.delivered_at,
      description: "Delivered",
      completed: shipment.status === "delivered",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandLogo size="md" priority className="h-12 md:h-14 lg:h-16" />
          <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Public tracking · {awb}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <FadeIn>
          {/* Shipment Header */}
          <TrackingHeader
            shipmentRef={shipment.shipment_ref}
            status={shipment.status}
            origin={shipment.origin}
            destination={shipment.destination}
            estimatedDelivery={shipment.estimated_delivery}
          />
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Timeline - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <FadeIn delay={0.1}>
              <GlassCard variant="elevated">
                <GlassCardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Shipment Timeline</h2>
                  <TrackingTimeline events={timelineEvents} />
                </GlassCardContent>
              </GlassCard>
            </FadeIn>

            {/* Map (Optional - if you add Google Maps) */}
            {/* <FadeIn delay={0.2}>
              <GlassCard variant="elevated">
                <GlassCardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Route Map</h2>
                  <TrackingMap origin={shipment.origin} destination={shipment.destination} />
                </GlassCardContent>
              </GlassCard>
            </FadeIn> */}
          </div>

          {/* Details - Right Column (1/3) */}
          <div className="space-y-6">
            <FadeIn delay={0.15}>
              <GlassCard variant="elevated">
                <GlassCardContent className="p-6">
                  <h3 className="font-semibold mb-4">Shipment Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Reference</dt>
                      <dd className="font-medium">{shipment.shipment_ref}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-medium">{shipment.weight} kg</dd>
                    </div>
                    {shipment.barcodes?.[0] && (
                      <div>
                        <dt className="text-muted-foreground">Barcode</dt>
                        <dd className="font-mono text-xs">{shipment.barcodes[0].barcode_number}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </GlassCardContent>
              </GlassCard>
            </FadeIn>

            {shipment.customers && (
              <FadeIn delay={0.2}>
                <GlassCard variant="elevated">
                  <GlassCardContent className="p-6">
                    <h3 className="font-semibold mb-4">Customer Details</h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="font-medium">{shipment.customers.name}</dd>
                      </div>
                      {shipment.customers.phone && (
                        <div>
                          <dt className="text-muted-foreground">Phone</dt>
                          <dd className="font-medium">{shipment.customers.phone}</dd>
                        </div>
                      )}
                    </dl>
                  </GlassCardContent>
                </GlassCard>
              </FadeIn>
            )}

            <FadeIn delay={0.25}>
              <GlassCard variant="subtle" className="bg-muted/30">
                <GlassCardContent className="p-6">
                  <p className="text-xs text-muted-foreground">
                    Need help? Contact us at support@tapango.com or call +91-XXX-XXX-XXXX
                  </p>
                </GlassCardContent>
              </GlassCard>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
