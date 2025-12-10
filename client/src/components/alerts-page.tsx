import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/category-icon";
import { ExpirationBadge } from "@/components/expiration-badge";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { type FreezerItem, type Location } from "@shared/schema";
import { getLocationLabel } from "@/components/settings-panel";
import { format, parseISO, isValid, differenceInDays, isToday, isPast } from "date-fns";

interface AlertsPageProps {
  items: FreezerItem[];
  onEditItem: (item: FreezerItem) => void;
}

function getExpirationStatus(expirationDate: string | null) {
  if (!expirationDate || !isValid(parseISO(expirationDate))) {
    return { status: "none", label: "No date", color: "text-muted-foreground" };
  }

  const date = parseISO(expirationDate);
  const daysUntil = differenceInDays(date, new Date());

  if (isPast(date) && !isToday(date)) {
    return { status: "expired", label: "Expired", color: "text-destructive" };
  }
  if (isToday(date)) {
    return { status: "today", label: "Expires today", color: "text-orange-500" };
  }
  if (daysUntil <= 7) {
    return { status: "soon", label: `${daysUntil} days left`, color: "text-yellow-500" };
  }
  return { status: "ok", label: `${daysUntil} days left`, color: "text-green-500" };
}

function getDaysLeftText(expirationDate: string | null): { text: string; daysLeft: number } | null {
  if (!expirationDate || !isValid(parseISO(expirationDate))) return null;
  
  const date = parseISO(expirationDate);
  const daysLeft = differenceInDays(date, new Date());
  
  if (isPast(date) && !isToday(date)) {
    const daysOverdue = Math.abs(daysLeft);
    return { text: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`, daysLeft };
  }
  if (isToday(date)) {
    return { text: "0 days left", daysLeft: 0 };
  }
  return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, daysLeft };
}

function ExpirationCard({ item, onEdit }: { item: FreezerItem; onEdit: () => void }) {
  const status = getExpirationStatus(item.expirationDate);
  const formattedDate = item.expirationDate && isValid(parseISO(item.expirationDate))
    ? format(parseISO(item.expirationDate), "MMM d, yyyy")
    : null;
  const daysInfo = getDaysLeftText(item.expirationDate);

  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={onEdit}
      data-testid={`card-alert-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CategoryIcon category={item.category} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {getLocationLabel(item.location as Location)} - {item.quantity} {item.unit}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <ExpirationBadge expirationDate={item.expirationDate} />
            {formattedDate && (
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertsPage({ items, onEditItem }: AlertsPageProps) {
  const itemsWithExpiration = items.filter(
    (item) => item.expirationDate && isValid(parseISO(item.expirationDate))
  );

  const expiredItems = itemsWithExpiration.filter((item) => {
    const date = parseISO(item.expirationDate!);
    return isPast(date) && !isToday(date);
  });

  const expiringTodayItems = itemsWithExpiration.filter((item) => {
    return isToday(parseISO(item.expirationDate!));
  });

  const expiringSoonItems = itemsWithExpiration.filter((item) => {
    const date = parseISO(item.expirationDate!);
    const daysUntil = differenceInDays(date, new Date());
    return daysUntil > 0 && daysUntil <= 7;
  });

  const hasAlerts = expiredItems.length > 0 || expiringTodayItems.length > 0 || expiringSoonItems.length > 0;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h1 className="text-lg font-semibold">Use By Alerts</h1>
      </div>

      {!hasAlerts ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No use by alerts</p>
          <p className="text-sm text-muted-foreground">All your items are fresh!</p>
        </div>
      ) : (
        <>
          {expiredItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Expired ({expiredItems.length})
              </h2>
              {expiredItems.map((item) => (
                <ExpirationCard key={item.id} item={item} onEdit={() => onEditItem(item)} />
              ))}
            </div>
          )}

          {expiringTodayItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-orange-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Use By Today ({expiringTodayItems.length})
              </h2>
              {expiringTodayItems.map((item) => (
                <ExpirationCard key={item.id} item={item} onEdit={() => onEditItem(item)} />
              ))}
            </div>
          )}

          {expiringSoonItems.length > 0 && (
            <div className="space-y-3">
              {expiringSoonItems.map((item) => (
                <ExpirationCard key={item.id} item={item} onEdit={() => onEditItem(item)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function getAlertCount(items: FreezerItem[]): number {
  return items.filter((item) => {
    if (!item.expirationDate || !isValid(parseISO(item.expirationDate))) return false;
    const date = parseISO(item.expirationDate);
    const daysUntil = differenceInDays(date, new Date());
    return isPast(date) || daysUntil <= 7;
  }).length;
}
