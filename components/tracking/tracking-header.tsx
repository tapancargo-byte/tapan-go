import { Badge } from "@/components/ui/badge";
import PackageIcon from "@/components/icons/package";
import MapPinIcon from "@/components/icons/map-pin";
import CalendarIcon from "@/components/icons/calendar";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

interface TrackingHeaderProps {
  shipmentRef: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery?: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending Pickup", variant: "outline" },
  "in-transit": { label: "In Transit", variant: "secondary" },
  "out-for-delivery": { label: "Out for Delivery", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  delayed: { label: "Delayed", variant: "destructive" },
};

export function TrackingHeader({
  shipmentRef,
  status,
  origin,
  destination,
  estimatedDelivery,
}: TrackingHeaderProps) {
  const statusInfo = statusConfig[status] || { label: status, variant: "outline" };

  return (
    <GlassCard variant="elevated" className="overflow-hidden">
      <GlassCardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PackageIcon className="h-5 w-5 text-brand" />
              <h1 className="text-2xl font-bold">{shipmentRef}</h1>
            </div>
            <Badge variant={statusInfo.variant} className="text-sm">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <MapPinIcon className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Origin</p>
              <p className="font-semibold">{origin}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <MapPinIcon className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-semibold">{destination}</p>
            </div>
          </div>

          {estimatedDelivery && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <CalendarIcon className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                <p className="font-semibold">
                  {new Date(estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
