import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Snowflake } from "lucide-react";
import { categories, type Category } from "@shared/schema";
import { categoryConfig } from "@/components/category-icon";

export function getDefaultCategory(): Category {
  const stored = localStorage.getItem("defaultCategory");
  if (stored && categories.includes(stored as Category)) {
    return stored as Category;
  }
  return "meat";
}

export function SettingsPanel() {
  const [defaultCategory, setDefaultCategory] = useState<Category>(getDefaultCategory);

  useEffect(() => {
    localStorage.setItem("defaultCategory", defaultCategory);
  }, [defaultCategory]);

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
                    {categoryConfig[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <h3 className="font-medium">Freezer Inventory</h3>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your frozen food items, manage expiration dates, and never waste food again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
