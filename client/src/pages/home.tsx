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
import type { FreezerItem, Category } from "@shared/schema";

type Tab = "inventory" | "alerts" | "list" | "settings";

export default function Home() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: items = [], isLoading } = useQuery<FreezerItem[]>({
    queryKey: ["/api/items"],
  });

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

    return result;
  }, [items, selectedCategory]);

  const handleEditItem = (item: FreezerItem) => {
    navigate(`/item/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-36">
      {activeTab === "inventory" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} />
          ) : filteredAndSortedItems.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} hasFilters />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedItems.map((item) => (
                <FreezerItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
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
        <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-orange-500 dark:bg-orange-600 px-4 py-2">
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
