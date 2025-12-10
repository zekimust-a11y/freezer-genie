import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Snowflake, Plus, X, LogOut, Refrigerator, Eye, EyeOff, Tag } from "lucide-react";
import { categories, type Category } from "@shared/schema";
import { categoryConfig } from "@/components/category-icon";

export type DateFormat = "MMM d, yyyy" | "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
export type WeightUnit = "metric" | "imperial";
export type DefaultExpiry = "none" | "7" | "14" | "30" | "60" | "90" | "180" | "365";
export type FreezerType = "chest" | "under_counter" | "fridge_freezer" | "full_height" | "custom";

export interface Freezer {
  id: string;
  name: string;
  type: FreezerType;
}

const freezerTypeLabels: Record<FreezerType, string> = {
  chest: "Chest Freezer",
  under_counter: "Under Counter",
  fridge_freezer: "Fridge Freezer",
  full_height: "Full Height",
  custom: "Custom",
};

const dateFormatOptions: { value: DateFormat; label: string; example: string }[] = [
  { value: "MMM d, yyyy", label: "Dec 15, 2024", example: "Dec 15, 2024" },
  { value: "dd/MM/yyyy", label: "15/12/2024", example: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "12/15/2024", example: "MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "2024-12-15", example: "YYYY-MM-DD" },
];

const weightUnitOptions: { value: WeightUnit; label: string }[] = [
  { value: "metric", label: "Metric (kg, g)" },
  { value: "imperial", label: "Imperial (lb, oz)" },
];

const defaultExpiryOptions: { value: DefaultExpiry; label: string }[] = [
  { value: "none", label: "No default" },
  { value: "7", label: "1 week" },
  { value: "14", label: "2 weeks" },
  { value: "30", label: "1 month" },
  { value: "60", label: "2 months" },
  { value: "90", label: "3 months" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
];

const defaultLowStockOptions: { value: string; label: string }[] = [
  { value: "0", label: "Disabled" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "10", label: "10" },
];

export function getDefaultCategory(): Category {
  const stored = localStorage.getItem("defaultCategory");
  if (stored && categories.includes(stored as Category)) {
    return stored as Category;
  }
  return "meat_fish";
}

export function getDateFormat(): DateFormat {
  const stored = localStorage.getItem("dateFormat");
  if (stored && dateFormatOptions.some(opt => opt.value === stored)) {
    return stored as DateFormat;
  }
  return "MMM d, yyyy";
}

export function getWeightUnit(): WeightUnit {
  const stored = localStorage.getItem("weightUnit");
  if (stored === "metric" || stored === "imperial") {
    return stored;
  }
  return "metric";
}

export function getCustomLocations(): string[] {
  try {
    const stored = localStorage.getItem("customLocations");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export interface CustomCategory {
  id: string;
  name: string;
}

export function getCustomCategories(): CustomCategory[] {
  try {
    const stored = localStorage.getItem("customCategories");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export function getAllCategories(): string[] {
  const customCats = getCustomCategories();
  return [...categories, ...customCats.map(c => c.id)];
}

export function getCustomCategoryLabel(categoryId: string): string | null {
  const customCats = getCustomCategories();
  const found = customCats.find(c => c.id === categoryId);
  return found ? found.name : null;
}

export function getDefaultExpiry(): DefaultExpiry {
  const stored = localStorage.getItem("defaultExpiry");
  if (stored && defaultExpiryOptions.some(opt => opt.value === stored)) {
    return stored as DefaultExpiry;
  }
  return "none";
}

export function getDefaultExpiryDate(): string | null {
  const expiry = getDefaultExpiry();
  if (expiry === "none") return null;
  const days = parseInt(expiry);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function getDefaultLowStock(): number {
  const stored = localStorage.getItem("defaultLowStock");
  if (stored) {
    const val = parseInt(stored);
    if (!isNaN(val)) return val;
  }
  return 2;
}

export function getCategoryLabels(): Record<Category, string> {
  try {
    const stored = localStorage.getItem("categoryLabels");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  const defaults: Record<Category, string> = {} as Record<Category, string>;
  categories.forEach(cat => {
    defaults[cat] = categoryConfig[cat].label;
  });
  return defaults;
}

export function getCategoryLabel(category: Category): string {
  const labels = getCategoryLabels();
  return labels[category] || categoryConfig[category].label;
}

export function getFreezers(): Freezer[] {
  try {
    const stored = localStorage.getItem("freezers");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return [{ id: "default", name: "My Freezer", type: "fridge_freezer" }];
}

export function getSelectedFreezer(): string {
  const stored = localStorage.getItem("selectedFreezer");
  return stored || "all";
}

export function setSelectedFreezer(freezerId: string): void {
  localStorage.setItem("selectedFreezer", freezerId);
}

export function getFreezerOptions(): { id: string; name: string }[] {
  const freezers = getFreezers();
  return [
    { id: "all", name: "All Freezers" },
    ...freezers.map(f => ({ id: f.id, name: f.name }))
  ];
}

export function getHiddenCategories(): Category[] {
  try {
    const stored = localStorage.getItem("hiddenCategories");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export function getVisibleCategories(): Category[] {
  const hidden = getHiddenCategories();
  return categories.filter(cat => !hidden.includes(cat));
}

export function SettingsPanel() {
  const [defaultCategory, setDefaultCategory] = useState<Category>(getDefaultCategory);
  const [dateFormat, setDateFormat] = useState<DateFormat>(getDateFormat);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(getWeightUnit);
  const [defaultExpiry, setDefaultExpiry] = useState<DefaultExpiry>(getDefaultExpiry);
  const [defaultLowStock, setDefaultLowStock] = useState<number>(getDefaultLowStock);
  const [customLocations, setCustomLocations] = useState<string[]>(getCustomLocations);
  const [newLocation, setNewLocation] = useState("");
  const [categoryLabels, setCategoryLabels] = useState<Record<Category, string>>(getCategoryLabels);
  const [freezers, setFreezers] = useState<Freezer[]>(getFreezers);
  const [newFreezerName, setNewFreezerName] = useState("");
  const [newFreezerType, setNewFreezerType] = useState<FreezerType>("fridge_freezer");
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>(getHiddenCategories);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(getCustomCategories);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    localStorage.setItem("defaultCategory", defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    localStorage.setItem("dateFormat", dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem("weightUnit", weightUnit);
  }, [weightUnit]);

  useEffect(() => {
    localStorage.setItem("customLocations", JSON.stringify(customLocations));
  }, [customLocations]);

  useEffect(() => {
    localStorage.setItem("defaultExpiry", defaultExpiry);
  }, [defaultExpiry]);

  useEffect(() => {
    localStorage.setItem("defaultLowStock", defaultLowStock.toString());
  }, [defaultLowStock]);

  useEffect(() => {
    localStorage.setItem("categoryLabels", JSON.stringify(categoryLabels));
  }, [categoryLabels]);

  useEffect(() => {
    localStorage.setItem("freezers", JSON.stringify(freezers));
  }, [freezers]);

  useEffect(() => {
    localStorage.setItem("hiddenCategories", JSON.stringify(hiddenCategories));
  }, [hiddenCategories]);

  useEffect(() => {
    localStorage.setItem("customCategories", JSON.stringify(customCategories));
  }, [customCategories]);

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const id = `custom_${Date.now()}`;
      const newCategory: CustomCategory = { id, name: trimmed };
      setCustomCategories([...customCategories, newCategory]);
      setNewCategoryName("");
    }
  };

  const handleRemoveCategory = (id: string) => {
    setCustomCategories(customCategories.filter(c => c.id !== id));
  };

  const handleCustomCategoryNameChange = (id: string, name: string) => {
    setCustomCategories(customCategories.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleToggleCategoryVisibility = (category: Category) => {
    setHiddenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddLocation = () => {
    const trimmed = newLocation.trim();
    if (trimmed && !customLocations.includes(trimmed)) {
      setCustomLocations([...customLocations, trimmed]);
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (location: string) => {
    setCustomLocations(customLocations.filter(l => l !== location));
  };

  const handleCategoryLabelChange = (category: Category, newLabel: string) => {
    setCategoryLabels(prev => ({
      ...prev,
      [category]: newLabel || categoryConfig[category].label
    }));
  };

  const handleAddFreezer = () => {
    const trimmed = newFreezerName.trim();
    if (trimmed) {
      const newFreezer: Freezer = {
        id: Date.now().toString(),
        name: trimmed,
        type: newFreezerType,
      };
      setFreezers([...freezers, newFreezer]);
      setNewFreezerName("");
    }
  };

  const handleRemoveFreezer = (id: string) => {
    if (freezers.length > 1) {
      setFreezers(freezers.filter(f => f.id !== id));
    }
  };

  const handleFreezerTypeChange = (id: string, type: FreezerType) => {
    setFreezers(freezers.map(f => f.id === id ? { ...f, type } : f));
  };

  const handleFreezerNameChange = (id: string, name: string) => {
    setFreezers(freezers.map(f => f.id === id ? { ...f, name } : f));
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Default Category</span>
            <Select value={defaultCategory} onValueChange={(v) => setDefaultCategory(v as Category)}>
              <SelectTrigger className="w-[160px]" data-testid="select-default-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Date Format</span>
            <Select value={dateFormat} onValueChange={(v) => setDateFormat(v as DateFormat)}>
              <SelectTrigger className="w-[160px]" data-testid="select-date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFormatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Weight Units</span>
            <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as WeightUnit)}>
              <SelectTrigger className="w-[160px]" data-testid="select-weight-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weightUnitOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Default Use By</span>
            <Select value={defaultExpiry} onValueChange={(v) => setDefaultExpiry(v as DefaultExpiry)}>
              <SelectTrigger className="w-[160px]" data-testid="select-default-expiry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultExpiryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Low Stock Alert</span>
            <Select value={defaultLowStock.toString()} onValueChange={(v) => setDefaultLowStock(parseInt(v))}>
              <SelectTrigger className="w-[160px]" data-testid="select-default-low-stock">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultLowStockOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Show items from</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Freezer name..."
              value={newFreezerName}
              onChange={(e) => setNewFreezerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFreezer()}
              className="flex-1"
              data-testid="input-new-freezer"
            />
            <Select value={newFreezerType} onValueChange={(v) => setNewFreezerType(v as FreezerType)}>
              <SelectTrigger className="w-[140px]" data-testid="select-new-freezer-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(freezerTypeLabels) as FreezerType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {freezerTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" onClick={handleAddFreezer} data-testid="button-add-freezer">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {freezers.map((freezer) => (
            <div
              key={freezer.id}
              className="flex items-center gap-2 bg-muted p-2 rounded-md"
            >
              <Refrigerator className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={freezer.name}
                onChange={(e) => handleFreezerNameChange(freezer.id, e.target.value)}
                className="flex-1 h-8"
                data-testid={`input-freezer-name-${freezer.id}`}
              />
              <Select 
                value={freezer.type} 
                onValueChange={(v) => handleFreezerTypeChange(freezer.id, v as FreezerType)}
              >
                <SelectTrigger className="w-[130px]" data-testid={`select-freezer-type-${freezer.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(freezerTypeLabels) as FreezerType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {freezerTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {freezers.length > 1 && (
                <button
                  onClick={() => handleRemoveFreezer(freezer.id)}
                  className="text-muted-foreground hover:text-foreground p-1"
                  data-testid={`button-remove-freezer-${freezer.id}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Names</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat) => {
            const isHidden = hiddenCategories.includes(cat);
            return (
              <div key={cat} className={`flex items-center gap-3 ${isHidden ? "opacity-50" : ""}`}>
                <button
                  onClick={() => handleToggleCategoryVisibility(cat)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  data-testid={`button-toggle-category-${cat}`}
                >
                  {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Input
                  value={categoryLabels[cat] || ""}
                  onChange={(e) => handleCategoryLabelChange(cat, e.target.value)}
                  placeholder={categoryConfig[cat].label}
                  className="flex-1"
                  data-testid={`input-category-label-${cat}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              data-testid="input-new-category"
            />
            <Button size="icon" onClick={handleAddCategory} data-testid="button-add-category">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {customCategories.length > 0 ? (
            <div className="space-y-2">
              {customCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 bg-muted p-2 rounded-md"
                >
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={cat.name}
                    onChange={(e) => handleCustomCategoryNameChange(cat.id, e.target.value)}
                    className="flex-1 h-8"
                    data-testid={`input-custom-category-${cat.id}`}
                  />
                  <button
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="text-muted-foreground hover:text-foreground p-1"
                    data-testid={`button-remove-category-${cat.id}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No custom categories added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add location name..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
              data-testid="input-new-location"
            />
            <Button size="icon" onClick={handleAddLocation} data-testid="button-add-location">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {customLocations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customLocations.map((loc) => (
                <div
                  key={loc}
                  className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                >
                  <span>{loc}</span>
                  <button
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`button-remove-location-${loc}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No custom locations added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark Mode</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Snowflake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Freezer Genie</h3>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your frozen food items, manage expiration dates, and never waste food again.
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" asChild data-testid="button-logout">
        <a href="/api/logout">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </a>
      </Button>
    </div>
  );
}
