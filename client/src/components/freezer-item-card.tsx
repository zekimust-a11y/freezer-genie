import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";
import { CategoryIcon, getCategoryLabel } from "@/components/category-icon";
import { ExpirationBadge } from "@/components/expiration-badge";
import { getDateFormat } from "@/components/settings-panel";
import { locationLabels, type FreezerItem } from "@shared/schema";
import { format, parseISO, isValid } from "date-fns";

interface FreezerItemCardProps {
  item: FreezerItem;
  onEdit: (item: FreezerItem) => void;
}

export function FreezerItemCard({ item, onEdit }: FreezerItemCardProps) {
  const formattedDate = item.expirationDate && isValid(parseISO(item.expirationDate))
    ? format(parseISO(item.expirationDate), getDateFormat())
    : null;

  const isLowStock = (item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0);

  return (
    <Card 
      className="cursor-pointer hover-elevate transition-all"
      onClick={() => onEdit(item)}
      data-testid={`card-freezer-item-${item.id}`}
    >
      <CardContent className="p-4">
        {/* Header row: Name + Qty left, Category right */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 
              className="font-medium text-base truncate"
              data-testid={`text-item-name-${item.id}`}
            >
              {item.name}
            </h3>
            <span className="text-sm text-muted-foreground shrink-0">
              x{item.quantity}
            </span>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs gap-1 shrink-0">
                <AlertCircle className="h-3 w-3" />
                Low
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <CategoryIcon category={item.category} />
            <span className="text-xs text-muted-foreground">
              {getCategoryLabel(item.category)}
            </span>
          </div>
        </div>

        {item.location && item.location !== "unassigned" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{locationLabels[item.location]}</span>
          </div>
        )}

        {item.expirationDate && (
          <div className="flex items-center gap-2 flex-wrap">
            <ExpirationBadge expirationDate={item.expirationDate} />
            {formattedDate && (
              <span className="text-xs text-muted-foreground">
                Expiry date: {formattedDate}
              </span>
            )}
          </div>
        )}

        {item.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {item.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
