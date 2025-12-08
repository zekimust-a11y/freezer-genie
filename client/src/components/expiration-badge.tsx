import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO, isValid } from "date-fns";

interface ExpirationBadgeProps {
  expirationDate: string | null;
}

type ExpirationStatus = "fresh" | "use_soon" | "urgent" | "expired" | "unknown";

function getExpirationStatus(expirationDate: string | null): { status: ExpirationStatus; daysLeft: number | null } {
  if (!expirationDate) {
    return { status: "unknown", daysLeft: null };
  }

  const date = parseISO(expirationDate);
  if (!isValid(date)) {
    return { status: "unknown", daysLeft: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = differenceInDays(date, today);

  if (daysLeft < 0) {
    return { status: "expired", daysLeft };
  } else if (daysLeft <= 3) {
    return { status: "urgent", daysLeft };
  } else if (daysLeft <= 7) {
    return { status: "use_soon", daysLeft };
  } else {
    return { status: "fresh", daysLeft };
  }
}

const statusConfig: Record<ExpirationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  fresh: { label: "Fresh", variant: "secondary" },
  use_soon: { label: "Use Soon", variant: "default", className: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700" },
  urgent: { label: "Urgent", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
  unknown: { label: "No Date", variant: "outline" },
};

export function ExpirationBadge({ expirationDate }: ExpirationBadgeProps) {
  const { status, daysLeft } = getExpirationStatus(expirationDate);
  const config = statusConfig[status];

  let displayText = config.label;
  if (status === "fresh" && daysLeft !== null) {
    displayText = `${daysLeft}d left`;
  } else if (status === "use_soon" && daysLeft !== null) {
    displayText = `${daysLeft}d left`;
  } else if (status === "urgent" && daysLeft !== null) {
    displayText = daysLeft === 0 ? "Today" : `${daysLeft}d left`;
  } else if (status === "expired" && daysLeft !== null) {
    displayText = `${Math.abs(daysLeft)}d ago`;
  }

  return (
    <Badge 
      variant={config.variant} 
      className={`text-xs ${config.className || ""}`}
      data-testid={`badge-expiration-${status}`}
    >
      {displayText}
    </Badge>
  );
}

export { getExpirationStatus };
