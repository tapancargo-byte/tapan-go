import { Truck } from "lucide-react";

export default function TruckIcon({
  className = 'w-6 h-6',
}: {
  className?: string;
}) {
  return <Truck className={className} />;
}
