import { Package, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "inventory" | "search" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "inventory" as Tab, label: "Inventory", icon: Package },
    { id: "search" as Tab, label: "Search", icon: Search },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-14 px-6 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => onTabChange(tab.id)}
              data-testid={`button-nav-${tab.id}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
