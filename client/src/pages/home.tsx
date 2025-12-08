import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CategoryFilter } from "@/components/category-filter";
import { FreezerItemCard } from "@/components/freezer-item-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { BottomNav } from "@/components/bottom-nav";
import { SettingsPanel } from "@/components/settings-panel";
import { AlertsPage, getAlertCount } from "@/components/alerts-page";
import { ShoppingListPage, getListCount } from "@/components/shopping-list-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search, X, Snowflake, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FreezerItem, Category } from "@shared/schema";

type Tab = "inventory" | "alerts" | "list" | "settings";
type SortOption = "expiry" | "name" | "quantity" | "recent";

const sortLabels: Record<SortOption, string> = {
  expiry: "Expiry Date",
  name: "Name",
  quantity: "Quantity",
  recent: "Recently Added",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("expiry");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items = [], isLoading } = useQuery<FreezerItem[]>({
    queryKey: ["/api/items"],
  });

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => 
        item.name.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    switch (sortBy) {
      case "expiry":
        result.sort((a, b) => {
          if (!a.expirationDate && !b.expirationDate) return 0;
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        });
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "quantity":
        result.sort((a, b) => b.quantity - a.quantity);
        break;
      case "recent":
        result.reverse();
        break;
    }

    return result;
  }, [items, selectedCategory, sortBy, searchQuery]);

  const { user } = useAuth();

  const handleEditItem = (item: FreezerItem) => {
    navigate(`/item/${item.id}`);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background pb-44">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-6 w-6 text-cyan-500" />
              <h1 className="text-lg font-semibold">Freezer Inventory</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" asChild data-testid="button-logout">
                <a href="/api/logout">
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {activeTab === "inventory" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!isLoading && items.length > 0 && (
            <div className="flex items-center justify-between gap-3 mb-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px]" data-testid="select-sort">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <SelectItem key={option} value={option} data-testid={`select-sort-${option}`}>
                      {sortLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 max-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} />
          ) : filteredAndSortedItems.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} hasFilters />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedItems.map((item, index) => (
                <FreezerItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  index={index}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {activeTab === "alerts" && (
        <div className="max-w-6xl mx-auto">
          <AlertsPage items={items} onEditItem={handleEditItem} />
        </div>
      )}

      {activeTab === "list" && (
        <div className="max-w-6xl mx-auto">
          <ShoppingListPage items={items} />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-6xl mx-auto">
          <SettingsPanel />
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="fixed bottom-[64px] left-0 right-0 z-50 bg-background border-t px-4 py-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      )}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddItem={() => navigate("/add")}
        alertCount={getAlertCount(items)}
        listCount={getListCount(items)}
      />
    </div>
  );
}
