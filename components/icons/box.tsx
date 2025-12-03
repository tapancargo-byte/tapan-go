import { Box } from "lucide-react";

export default function BoxIcon({
  className = 'w-6 h-6',
}: {
  className?: string;
}) {
  return <Box className={className} />;
}
