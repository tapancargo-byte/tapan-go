import CheckIcon from "@/components/icons/check";
import CircleIcon from "@/components/icons/circle";
import PackageIcon from "@/components/icons/package";
import TruckIcon from "@/components/icons/truck";
import HomeIcon from "@/components/icons/home";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  location: string;
  timestamp: string | null;
  description: string;
  completed: boolean;
}

interface TrackingTimelineProps {
  events: TimelineEvent[];
}

const statusIcons: Record<string, React.ElementType> = {
  created: PackageIcon,
  "in-transit": TruckIcon,
  "out-for-delivery": TruckIcon,
  delivered: HomeIcon,
};

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = statusIcons[event.status] || CircleIcon;
        const isLast = index === events.length - 1;
        const isActive = event.completed;

        return (
          <div key={index} className="relative flex gap-4 pb-8">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[19px] top-[40px] w-0.5 h-full -ml-px",
                  isActive ? "bg-brand" : "bg-border"
                )}
              />
            )}

            {/* Icon Circle */}
            <div className="relative z-10">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isActive
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {isActive ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Event Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={cn(
                      "font-semibold",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {event.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.location}
                  </p>
                </div>
                {event.timestamp && (
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
