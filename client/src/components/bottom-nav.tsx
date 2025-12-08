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

interface NavItemProps {
  icon: typeof Package;
  label: string;
  isActive: boolean;
  onClick: () => void;
  testId: string;
  badge?: number;
}

function NavItem({ icon: Icon, label, isActive, onClick, testId, badge }: NavItemProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-14 px-3 rounded-xl transition-all ${
          isActive 
            ? "bg-primary/15 text-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        data-testid={testId}
      >
        <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
          {label}
        </span>
      </button>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-0 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
  );
}

export function BottomNav({ 
  activeTab, 
  onTabChange, 
  onAddItem,
  alertCount = 0,
  listCount = 0,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t">
      <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-2 py-1">
        <NavItem
          icon={Package}
          label="Inventory"
          isActive={activeTab === "inventory"}
          onClick={() => onTabChange("inventory")}
          testId="button-nav-inventory"
        />

        <NavItem
          icon={AlertTriangle}
          label="Alerts"
          isActive={activeTab === "alerts"}
          onClick={() => onTabChange("alerts")}
          testId="button-nav-alerts"
          badge={alertCount}
        />

        {/* Add Button - Center prominent */}
        <Button
          onClick={onAddItem}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg -mt-4"
          data-testid="button-add-item"
        >
          <Plus className="h-7 w-7" />
        </Button>

        <NavItem
          icon={ShoppingCart}
          label="List"
          isActive={activeTab === "list"}
          onClick={() => onTabChange("list")}
          testId="button-nav-list"
          badge={listCount}
        />

        <NavItem
          icon={Settings}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={() => onTabChange("settings")}
          testId="button-nav-settings"
        />
      </div>
    </nav>
  );
}
