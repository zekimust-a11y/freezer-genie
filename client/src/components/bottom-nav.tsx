import { useRef, useEffect, useState } from "react";
import { Package, ShoppingCart, AlertTriangle, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  itemRef?: React.RefObject<HTMLButtonElement>;
}

function NavItem({ icon: Icon, label, isActive, onClick, testId, badge, itemRef }: NavItemProps) {
  return (
    <div className="relative">
      <button
        ref={itemRef}
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-14 px-3 rounded-xl transition-colors duration-200 ${
          isActive 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid={testId}
      >
        <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-primary" : ""}`}>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLButtonElement>(null);
  const alertsRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const tabRefs: Record<Tab, React.RefObject<HTMLButtonElement>> = {
    inventory: inventoryRef,
    alerts: alertsRef,
    list: listRef,
    settings: settingsRef,
  };

  useEffect(() => {
    const activeRef = tabRefs[activeTab];
    const container = containerRef.current;
    if (activeRef.current && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-md border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div ref={containerRef} className="relative flex items-center justify-around h-18 max-w-lg mx-auto px-2 py-1">
        {/* Animated highlight indicator */}
        <motion.div
          className="absolute top-1 h-14 bg-primary/15 rounded-xl pointer-events-none"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
        
        <NavItem
          icon={Package}
          label="Inventory"
          isActive={activeTab === "inventory"}
          onClick={() => onTabChange("inventory")}
          testId="button-nav-inventory"
          itemRef={inventoryRef}
        />

        <NavItem
          icon={AlertTriangle}
          label="Alerts"
          isActive={activeTab === "alerts"}
          onClick={() => onTabChange("alerts")}
          testId="button-nav-alerts"
          badge={alertCount}
          itemRef={alertsRef}
        />

        {/* Add Button - Center prominent */}
        <Button
          onClick={onAddItem}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg -mt-4 z-10"
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
          itemRef={listRef}
        />

        <NavItem
          icon={Settings}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={() => onTabChange("settings")}
          testId="button-nav-settings"
          itemRef={settingsRef}
        />
      </div>
    </nav>
  );
}
