import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { CategoryFilter } from "@/components/category-filter";
import { LocationFilter } from "@/components/location-filter";
import { FreezerItemCard } from "@/components/freezer-item-card";
import { AddEditItemDialog } from "@/components/add-edit-item-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ShoppingList } from "@/components/shopping-list";
import { ExpirationAlerts } from "@/components/expiration-alerts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import type { FreezerItem, FreezerItemFormData, Category, Location } from "@shared/schema";

type SortOption = "name" | "expiration" | "category" | "location";
type ViewMode = "grid" | "list";

export default function Home() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
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

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation) {
      result = result.filter((item) => item.location === selectedLocation);
    }

    // Sort
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
  }, [items, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const hasFilters = searchQuery.trim() !== "" || selectedCategory !== null || selectedLocation !== null;

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
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddItem={() => setIsAddDialogOpen(true)}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        onOpenExpirationAlerts={() => setIsExpirationAlertsOpen(true)}
        items={items}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filters */}
        <div className="mb-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Location Filters */}
        <div className="mb-6">
          <LocationFilter
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {/* Sort and View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[140px]" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiration" data-testid="select-sort-expiration">Expiration</SelectItem>
                <SelectItem value="name" data-testid="select-sort-name">Name</SelectItem>
                <SelectItem value="category" data-testid="select-sort-category">Category</SelectItem>
                <SelectItem value="location" data-testid="select-sort-location">Location</SelectItem>
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

        {/* Content */}
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

      {/* Add Dialog */}
      <AddEditItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <AddEditItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        item={deletingItem}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Shopping List */}
      <ShoppingList
        open={isShoppingListOpen}
        onOpenChange={setIsShoppingListOpen}
        items={items}
      />

      {/* Expiration Alerts */}
      <ExpirationAlerts
        open={isExpirationAlertsOpen}
        onOpenChange={setIsExpirationAlertsOpen}
        items={items}
        onEditItem={handleEditFromAlerts}
      />
    </div>
  );
}
