import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MapPin, AlertCircle } from "lucide-react";
import { CategoryIcon, getCategoryLabel } from "@/components/category-icon";
import { ExpirationBadge } from "@/components/expiration-badge";
import { locationLabels, type FreezerItem } from "@shared/schema";
import { format, parseISO, isValid } from "date-fns";

interface FreezerItemCardProps {
  item: FreezerItem;
  onEdit: (item: FreezerItem) => void;
  onDelete: (item: FreezerItem) => void;
}

export function FreezerItemCard({ item, onEdit, onDelete }: FreezerItemCardProps) {
  const formattedDate = item.expirationDate && isValid(parseISO(item.expirationDate))
    ? format(parseISO(item.expirationDate), "MMM d, yyyy")
    : null;

  const isLowStock = (item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0);

  return (
    <Card 
      className="group hover-elevate transition-all"
      data-testid={`card-freezer-item-${item.id}`}
    >
      <CardContent className="p-4">
        {/* Header row: Name left, Category right */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            className="font-medium text-base truncate flex-1"
            data-testid={`text-item-name-${item.id}`}
          >
            {item.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <CategoryIcon category={item.category} />
            <span className="text-xs text-muted-foreground">
              {getCategoryLabel(item.category)}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {item.quantity} {item.unit}{item.quantity > 1 && item.unit !== "item" ? "s" : ""}
              </span>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Low Stock
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span>{locationLabels[item.location]}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ExpirationBadge expirationDate={item.expirationDate} />
              {formattedDate && (
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              )}
            </div>

            {item.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {item.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              data-testid={`button-edit-${item.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item)}
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
