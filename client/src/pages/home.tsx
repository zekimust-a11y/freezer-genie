import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CategoryFilter } from "@/components/category-filter";
import { FreezerItemCard } from "@/components/freezer-item-card";
import { AddEditItemDialog } from "@/components/add-edit-item-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ShoppingList } from "@/components/shopping-list";
import { ExpirationAlerts } from "@/components/expiration-alerts";
import { BottomNav } from "@/components/bottom-nav";
import { SearchPanel } from "@/components/search-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, ShoppingCart, AlertTriangle, Snowflake } from "lucide-react";
import { ShoppingListBadge } from "@/components/shopping-list";
import { ExpirationAlertsBadge } from "@/components/expiration-alerts";
import type { FreezerItem, FreezerItemFormData, Category } from "@shared/schema";

type SortOption = "name" | "expiration" | "category" | "location";
type ViewMode = "grid" | "list";
type Tab = "inventory" | "search" | "settings";

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("expiration");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FreezerItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FreezerItem | null>(null);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isExpirationAlertsOpen, setIsExpirationAlertsOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery<FreezerItem[]>({
    queryKey: ["/api/items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FreezerItemFormData) => {
      const response = await apiRequest("POST", "/api/items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Item added",
        description: "Your item has been added to the freezer.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FreezerItemFormData }) => {
      const response = await apiRequest("PUT", `/api/items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setEditingItem(null);
      toast({
        title: "Item updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setDeletingItem(null);
      toast({
        title: "Item removed",
        description: "The item has been removed from your freezer.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "expiration":
          if (!a.expirationDate && !b.expirationDate) return 0;
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        case "category":
          return a.category.localeCompare(b.category);
        case "location":
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return result;
  }, [items, selectedCategory, sortBy]);

  const handleAddSubmit = (data: FreezerItemFormData) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: FreezerItemFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
    }
  };

  const handleEditFromAlerts = (item: FreezerItem) => {
    setIsExpirationAlertsOpen(false);
    setEditingItem(item);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <>
          <header className="sticky top-0 z-50 bg-background border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Snowflake className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-base font-semibold">Freezer Inventory</h1>
                    <p className="text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpirationAlertsOpen(true)}
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
                      onClick={() => setIsShoppingListOpen(true)}
                      data-testid="button-shopping-list"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                    <ShoppingListBadge items={items} />
                  </div>

                  <Button onClick={() => setIsAddDialogOpen(true)} size="sm" data-testid="button-add-item">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="mb-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[120px]" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expiration">Expiration</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="grid" data-testid="button-view-grid">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" data-testid="button-view-list">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : items.length === 0 ? (
              <EmptyState onAddItem={() => setIsAddDialogOpen(true)} />
            ) : filteredAndSortedItems.length === 0 ? (
              <EmptyState onAddItem={() => setIsAddDialogOpen(true)} hasFilters />
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }>
                {filteredAndSortedItems.map((item) => (
                  <FreezerItemCard
                    key={item.id}
                    item={item}
                    onEdit={setEditingItem}
                    onDelete={setDeletingItem}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="max-w-6xl mx-auto">
          <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Search</h1>
          </header>
          <SearchPanel
            items={items}
            onEdit={setEditingItem}
            onDelete={setDeletingItem}
          />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-6xl mx-auto">
          <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Settings</h1>
          </header>
          <SettingsPanel />
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dialogs */}
      <AddEditItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubmit}
        isLoading={createMutation.isPending}
      />

      <AddEditItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        item={deletingItem}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ShoppingList
        open={isShoppingListOpen}
        onOpenChange={setIsShoppingListOpen}
        items={items}
      />

      <ExpirationAlerts
        open={isExpirationAlertsOpen}
        onOpenChange={setIsExpirationAlertsOpen}
        items={items}
        onEditItem={handleEditFromAlerts}
      />
    </div>
  );
}
