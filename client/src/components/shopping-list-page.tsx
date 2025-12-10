import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/category-icon";
import { ShoppingCart, Check } from "lucide-react";
import { type FreezerItem, type Location } from "@shared/schema";
import { getLocationLabel } from "@/components/settings-panel";

interface ShoppingListPageProps {
  items: FreezerItem[];
  onEditItem: (item: FreezerItem) => void;
}

function getLowStockItems(items: FreezerItem[]): FreezerItem[] {
  return items.filter(
    (item) => (item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0)
  );
}

export function ShoppingListPage({ items, onEditItem }: ShoppingListPageProps) {
  const lowStockItems = getLowStockItems(items);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Shopping List</h1>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-12">
          <Check className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
          <p className="text-muted-foreground">Your freezer is well stocked!</p>
          <p className="text-sm text-muted-foreground">
            Set low stock thresholds on items to see them here when running low.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {lowStockItems.length} {lowStockItems.length === 1 ? "item" : "items"} to restock
          </p>
          
          {lowStockItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => onEditItem(item)}
              data-testid={`card-shopping-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CategoryIcon category={item.category} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getLocationLabel(item.location as Location)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {item.quantity} / {item.lowStockThreshold} {item.unit}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Need {(item.lowStockThreshold ?? 0) - item.quantity + 1}+ more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function getListCount(items: FreezerItem[]): number {
  return getLowStockItems(items).length;
}
