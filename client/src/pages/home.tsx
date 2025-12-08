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
import { BottomNav } from "@/components/bottom-nav";
import { SettingsPanel } from "@/components/settings-panel";
import { AlertsPage, getAlertCount } from "@/components/alerts-page";
import { ShoppingListPage, getListCount } from "@/components/shopping-list-page";
import type { FreezerItem, FreezerItemFormData, Category } from "@shared/schema";

type Tab = "inventory" | "alerts" | "list" | "settings";

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FreezerItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FreezerItem | null>(null);

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

    // Sort by expiration date by default
    result.sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

    return result;
  }, [items, selectedCategory]);

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
    setEditingItem(item);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAddItem={() => setIsAddDialogOpen(true)} />
          ) : filteredAndSortedItems.length === 0 ? (
            <EmptyState onAddItem={() => setIsAddDialogOpen(true)} hasFilters />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="max-w-6xl mx-auto">
          <AlertsPage items={items} onEditItem={handleEditFromAlerts} />
        </div>
      )}

      {/* Shopping List Tab */}
      {activeTab === "list" && (
        <div className="max-w-6xl mx-auto">
          <ShoppingListPage items={items} />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-6xl mx-auto">
          <SettingsPanel />
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddItem={() => setIsAddDialogOpen(true)}
        alertCount={getAlertCount(items)}
        listCount={getListCount(items)}
      />

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
    </div>
  );
}
