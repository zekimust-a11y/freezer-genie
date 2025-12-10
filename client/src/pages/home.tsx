import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CategoryFilter } from "@/components/category-filter";
import { FreezerItemCard, formatQuantity, getUnitLabel } from "@/components/freezer-item-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { BottomNav } from "@/components/bottom-nav";
import { SettingsPanel, getFreezerOptions, getSelectedFreezer, setSelectedFreezer, getLocationLabel, getFreezers, getFreezerLabel } from "@/components/settings-panel";
import { AlertsPage, getAlertCount } from "@/components/alerts-page";
import { ShoppingListPage, getListCount } from "@/components/shopping-list-page";
import { RecipesPage } from "@/components/recipes-page";
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
import { ArrowUpDown, Search, X, Snowflake, Refrigerator, LayoutGrid, Table, Settings } from "lucide-react";
import { VoiceControl, useVoiceCommands } from "@/components/voice-control";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { FreezerItem, Category, MeatSubcategory, ProduceSubcategory, PreparedMealsSubcategory, FrozenGoodsSubcategory, Location } from "@shared/schema";

type Tab = "inventory" | "alerts" | "list" | "recipes" | "settings";
type SortOption = "expiry" | "name" | "quantity" | "recent";

const sortLabels: Record<SortOption, string> = {
  expiry: "Use By Date",
  name: "Name",
  quantity: "Quantity",
  recent: "Recently Added",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<MeatSubcategory | ProduceSubcategory | PreparedMealsSubcategory | FrozenGoodsSubcategory | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("expiry");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedFreezerId, setSelectedFreezerId] = useState(getSelectedFreezer);
  const [freezerOptions, setFreezerOptions] = useState(getFreezerOptions());
  const [hasMultipleFreezers, setHasMultipleFreezers] = useState(getFreezers().length > 1);

  // Fetch freezers from API and sync to localStorage
  useEffect(() => {
    async function syncFreezers() {
      try {
        const response = await fetch("/api/freezers");
        if (response.ok) {
          const data = await response.json();
          const freezers = data.map((f: { id: string; name: string; type: string }) => ({
            id: f.id,
            name: f.name,
            type: f.type,
          }));
          localStorage.setItem("freezers", JSON.stringify(freezers));
          setFreezerOptions([
            { id: "all", name: "All Freezers" },
            ...freezers.map((f: { id: string; name: string }) => ({ id: f.id, name: f.name }))
          ]);
          setHasMultipleFreezers(freezers.length > 1);
        }
      } catch (error) {
        console.error("Failed to sync freezers:", error);
      }
    }
    syncFreezers();
  }, []);

  const handleFreezerChange = (freezerId: string) => {
    setSelectedFreezerId(freezerId);
    setSelectedFreezer(freezerId);
  };

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
      if (selectedSubcategory && (selectedCategory === "meat_fish" || selectedCategory === "produce" || selectedCategory === "prepared_meals" || selectedCategory === "frozen_goods")) {
        result = result.filter((item) => item.subCategory === selectedSubcategory);
      }
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
  }, [items, selectedCategory, selectedSubcategory, sortBy, searchQuery]);

  const { user } = useAuth();
  const { processCommand } = useVoiceCommands();
  const { toast } = useToast();

  const handleVoiceCommand = (command: string) => {
    const result = processCommand(command);
    
    switch (result.action) {
      case "add":
        navigate(`/add?name=${encodeURIComponent(result.value || "")}`);
        toast({ title: "Adding item", description: result.value });
        break;
      case "search":
        setSearchQuery(result.value || "");
        setActiveTab("inventory");
        toast({ title: "Searching", description: result.value });
        break;
      case "tab":
        setActiveTab(result.value as Tab);
        toast({ title: "Switched to", description: result.value });
        break;
      case "navigate":
        setActiveTab("inventory");
        break;
      default:
        toast({ title: "Didn't understand", description: `"${result.value}"`, variant: "destructive" });
    }
  };

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
    <div className="min-h-screen bg-background" style={{ paddingBottom: 'calc(11rem + env(safe-area-inset-bottom))' }}>
      <header className="sticky top-0 z-50 bg-background border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-6 w-6 text-[#1975D2]" />
              <Select value={selectedFreezerId} onValueChange={handleFreezerChange}>
                <SelectTrigger className="border-0 shadow-none p-0 h-auto gap-1 font-semibold text-lg" data-testid="select-freezer">
                  <Refrigerator className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {freezerOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id} data-testid={`select-freezer-${option.id}`}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab("settings")}
                data-testid="button-header-settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <VoiceControl onCommand={handleVoiceCommand} />
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
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("cards")}
                  className="rounded-r-none"
                  data-testid="button-view-cards"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                  data-testid="button-view-table"
                >
                  <Table className="h-4 w-4" />
                </Button>
              </div>
              {isSearchExpanded ? (
                <div className="relative flex-1 max-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8"
                    data-testid="input-search"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) {
                        setIsSearchExpanded(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchExpanded(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchExpanded(true)}
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} />
          ) : filteredAndSortedItems.length === 0 ? (
            <EmptyState onAddItem={() => navigate("/add")} hasFilters />
          ) : viewMode === "cards" ? (
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
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-sm">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Use By</th>
                    {hasMultipleFreezers && (
                      <th className="px-3 py-2 font-medium hidden md:table-cell">Freezer</th>
                    )}
                    <th className="px-3 py-2 font-medium hidden md:table-cell">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAndSortedItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover-elevate cursor-pointer"
                      onClick={() => handleEditItem(item)}
                      data-testid={`row-item-${item.id}`}
                    >
                      <td className="px-3 py-2 text-sm font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground capitalize">
                        {item.subCategory || item.category.replace("_", " ")}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {formatQuantity(item.quantity)} {getUnitLabel(item.unit, typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity)}
                      </td>
                      <td className="px-3 py-2 text-sm hidden sm:table-cell">
                        {item.expirationDate 
                          ? new Date(item.expirationDate).toLocaleDateString()
                          : "-"
                        }
                      </td>
                      {hasMultipleFreezers && (
                        <td className="px-3 py-2 text-sm text-muted-foreground hidden md:table-cell">
                          {getFreezerLabel(item.freezerId) || "-"}
                        </td>
                      )}
                      <td className="px-3 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {item.location && item.location !== "unassigned" 
                          ? getLocationLabel(item.location as Location) 
                          : "-"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <ShoppingListPage items={items} onEditItem={handleEditItem} />
        </div>
      )}

      {activeTab === "recipes" && (
        <div className="max-w-6xl mx-auto">
          <RecipesPage items={items} />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-6xl mx-auto">
          <SettingsPanel />
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="fixed left-0 right-0 z-50 bg-background border-t px-4 py-2" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={setSelectedCategory}
            onSubcategoryChange={setSelectedSubcategory}
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
