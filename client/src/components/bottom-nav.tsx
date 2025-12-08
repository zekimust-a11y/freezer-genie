import { Package, Search, Settings, Plus, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingListBadge } from "@/components/shopping-list";
import { ExpirationAlertsBadge } from "@/components/expiration-alerts";
import type { FreezerItem } from "@shared/schema";

type Tab = "inventory" | "search" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  items: FreezerItem[];
  onAddItem: () => void;
  onOpenShoppingList: () => void;
  onOpenExpirationAlerts: () => void;
}

export function BottomNav({ 
  activeTab, 
  onTabChange, 
  items,
  onAddItem,
  onOpenShoppingList,
  onOpenExpirationAlerts
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {/* Inventory Tab */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 h-14 px-4 ${
            activeTab === "inventory" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onTabChange("inventory")}
          data-testid="button-nav-inventory"
        >
          <Package className={`h-5 w-5 ${activeTab === "inventory" ? "text-primary" : ""}`} />
          <span className="text-xs">Inventory</span>
        </Button>

        {/* Expiration Alerts */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-14 px-4 text-muted-foreground"
            onClick={onOpenExpirationAlerts}
            data-testid="button-expiration-alerts"
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">Alerts</span>
          </Button>
          <ExpirationAlertsBadge items={items} />
        </div>

        {/* Add Button - Center prominent */}
        <Button
          onClick={onAddItem}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          data-testid="button-add-item"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Shopping List */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-14 px-4 text-muted-foreground"
            onClick={onOpenShoppingList}
            data-testid="button-shopping-list"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs">List</span>
          </Button>
          <ShoppingListBadge items={items} />
        </div>

        {/* Settings Tab */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 h-14 px-4 ${
            activeTab === "settings" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onTabChange("settings")}
          data-testid="button-nav-settings"
        >
          <Settings className={`h-5 w-5 ${activeTab === "settings" ? "text-primary" : ""}`} />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </nav>
  );
}
