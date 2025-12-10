import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/category-icon";
import { ShoppingCart, Check } from "lucide-react";
import { type FreezerItem, type Location } from "@shared/schema";
import { getLocationLabel, getUnitLabelConfig } from "@/components/settings-panel";

const weightUnits = ["lb", "kg", "oz", "g"];

function formatQuantity(quantity: number, unit: string): string {
  if (weightUnits.includes(unit)) {
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  }
  return Math.round(quantity).toString();
}

function getUnitLabel(unit: string, quantity: number): string {
  const labels = getUnitLabelConfig(unit);
  if (labels) {
    const displayQty = weightUnits.includes(unit) ? quantity : Math.round(quantity);
    return displayQty === 1 ? labels.singular : labels.plural;
  }
  return unit;
}

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
                    <CategoryIcon category={item.category} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      In stock: <span className="font-medium text-foreground">{formatQuantity(Number(item.quantity), item.unit)} {getUnitLabel(item.unit, Number(item.quantity))}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Minimum: <span className="font-medium text-foreground">{formatQuantity(item.lowStockThreshold ?? 0, item.unit)} {getUnitLabel(item.unit, item.lowStockThreshold ?? 0)}</span>
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      Need {formatQuantity(Math.max(0.01, (item.lowStockThreshold ?? 0) - Number(item.quantity)), item.unit)} more {getUnitLabel(item.unit, Math.max(1, (item.lowStockThreshold ?? 0) - Number(item.quantity)))}
                    </Badge>
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
