import { Package, ShoppingCart, AlertTriangle, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "inventory" | "alerts" | "list" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAddItem: () => void;
  alertCount?: number;
  listCount?: number;
}

export function BottomNav({ 
  activeTab, 
  onTabChange, 
  onAddItem,
  alertCount = 0,
  listCount = 0,
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

        {/* Expiration Alerts Tab */}
        <div className="relative">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-14 px-4 ${
              activeTab === "alerts" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onTabChange("alerts")}
            data-testid="button-nav-alerts"
          >
            <AlertTriangle className={`h-5 w-5 ${activeTab === "alerts" ? "text-primary" : ""}`} />
            <span className="text-xs">Alerts</span>
          </Button>
          {alertCount > 0 && (
            <span className="absolute -top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
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

        {/* Shopping List Tab */}
        <div className="relative">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-14 px-4 ${
              activeTab === "list" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onTabChange("list")}
            data-testid="button-nav-list"
          >
            <ShoppingCart className={`h-5 w-5 ${activeTab === "list" ? "text-primary" : ""}`} />
            <span className="text-xs">List</span>
          </Button>
          {listCount > 0 && (
            <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {listCount > 99 ? "99+" : listCount}
            </span>
          )}
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
