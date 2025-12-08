import { Snowflake, Plus, Search, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingListBadge } from "@/components/shopping-list";
import { ExpirationAlertsBadge } from "@/components/expiration-alerts";
import { ExportData } from "@/components/export-data";
import type { FreezerItem } from "@shared/schema";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddItem: () => void;
  onOpenShoppingList: () => void;
  onOpenExpirationAlerts: () => void;
  items: FreezerItem[];
}

export function Header({ 
  searchQuery, 
  onSearchChange, 
  onAddItem, 
  onOpenShoppingList,
  onOpenExpirationAlerts,
  items 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Snowflake className="h-6 w-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Freezer Inventory</h1>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} stored
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenExpirationAlerts}
                data-testid="button-expiration-alerts"
              >
                <AlertTriangle className="h-5 w-5" />
              </Button>
              <ExpirationAlertsBadge items={items} />
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenShoppingList}
                data-testid="button-shopping-list"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <ShoppingListBadge items={items} />
            </div>

            <ExportData items={items} />
            <ThemeToggle />
            
            <Button onClick={onAddItem} data-testid="button-add-item">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
