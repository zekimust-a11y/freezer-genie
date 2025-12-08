import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, X } from "lucide-react";
import { CategoryIcon, getCategoryLabel } from "@/components/category-icon";
import type { FreezerItem } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ShoppingListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: FreezerItem[];
}

function getLowStockItems(items: FreezerItem[]): FreezerItem[] {
  return items.filter(
    (item) => item.lowStockThreshold > 0 && item.quantity <= item.lowStockThreshold
  );
}

export function ShoppingList({ open, onOpenChange, items }: ShoppingListProps) {
  const lowStockItems = getLowStockItems(items);

  const handleExport = () => {
    const lines = lowStockItems.map(
      (item) => `- ${item.name} (${getCategoryLabel(item.category)}) - Need more`
    );
    const content = `Shopping List\n${new Date().toLocaleDateString()}\n\n${lines.join("\n")}`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </SheetTitle>
          <SheetDescription>
            Items that are running low based on your set thresholds
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No items running low. You're all stocked up!
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Set a "Low Stock Alert" threshold on items to track when they need restocking.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} to restock
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  data-testid="button-export-shopping-list"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <Card key={item.id} data-testid={`shopping-item-${item.id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CategoryIcon category={item.category} />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit} left (threshold: {item.lowStockThreshold})
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Low
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ShoppingListBadge({ items }: { items: FreezerItem[] }) {
  const count = getLowStockItems(items).length;
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
      data-testid="badge-low-stock-count"
    >
      {count}
    </Badge>
  );
}
