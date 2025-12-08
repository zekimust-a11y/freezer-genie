import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { locationLabels, type FreezerItem } from "@shared/schema";
import { differenceInDays, parseISO, isValid, format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ExpirationAlertsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: FreezerItem[];
  onEditItem: (item: FreezerItem) => void;
}

interface ExpiringItem extends FreezerItem {
  daysLeft: number;
  status: "expired" | "urgent" | "soon";
}

function getExpiringItems(items: FreezerItem[]): ExpiringItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items
    .filter((item) => item.expirationDate)
    .map((item) => {
      const date = parseISO(item.expirationDate!);
      if (!isValid(date)) return null;
      const daysLeft = differenceInDays(date, today);
      
      let status: ExpiringItem["status"];
      if (daysLeft < 0) status = "expired";
      else if (daysLeft <= 3) status = "urgent";
      else if (daysLeft <= 7) status = "soon";
      else return null;

      return { ...item, daysLeft, status };
    })
    .filter((item): item is ExpiringItem => item !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function ExpirationAlerts({ open, onOpenChange, items, onEditItem }: ExpirationAlertsProps) {
  const expiringItems = getExpiringItems(items);
  const expired = expiringItems.filter((i) => i.status === "expired");
  const urgent = expiringItems.filter((i) => i.status === "urgent");
  const soon = expiringItems.filter((i) => i.status === "soon");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Expiration Alerts
          </SheetTitle>
          <SheetDescription>
            Items that are expired or expiring soon
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {expiringItems.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No expiration alerts. Everything is fresh!
              </p>
            </div>
          ) : (
            <>
              {expired.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Expired ({expired.length})
                  </h3>
                  <div className="space-y-2">
                    {expired.map((item) => (
                      <ExpirationCard 
                        key={item.id} 
                        item={item} 
                        onEdit={() => onEditItem(item)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {urgent.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Use Within 3 Days ({urgent.length})
                  </h3>
                  <div className="space-y-2">
                    {urgent.map((item) => (
                      <ExpirationCard 
                        key={item.id} 
                        item={item} 
                        onEdit={() => onEditItem(item)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {soon.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Use Within 7 Days ({soon.length})
                  </h3>
                  <div className="space-y-2">
                    {soon.map((item) => (
                      <ExpirationCard 
                        key={item.id} 
                        item={item} 
                        onEdit={() => onEditItem(item)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ExpirationCard({ item, onEdit }: { item: ExpiringItem; onEdit: () => void }) {
  const badgeVariant = item.status === "expired" 
    ? "destructive" 
    : item.status === "urgent" 
    ? "destructive" 
    : "secondary";

  const badgeText = item.status === "expired"
    ? `${Math.abs(item.daysLeft)}d ago`
    : item.daysLeft === 0
    ? "Today"
    : `${item.daysLeft}d left`;

  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={onEdit}
      data-testid={`expiration-item-${item.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CategoryIcon category={item.category} />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {locationLabels[item.location]} - {item.quantity} {item.unit}
              </p>
            </div>
          </div>
          <Badge variant={badgeVariant} className="text-xs">
            {badgeText}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpirationAlertsBadge({ items }: { items: FreezerItem[] }) {
  const count = getExpiringItems(items).length;
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
      data-testid="badge-expiring-count"
    >
      {count}
    </Badge>
  );
}
