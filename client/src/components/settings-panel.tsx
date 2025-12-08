import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Snowflake } from "lucide-react";
import { categories, type Category } from "@shared/schema";
import { categoryConfig } from "@/components/category-icon";

export type DateFormat = "MMM d, yyyy" | "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
export type WeightUnit = "metric" | "imperial";

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

export function getDefaultCategory(): Category {
  const stored = localStorage.getItem("defaultCategory");
  if (stored && categories.includes(stored as Category)) {
    return stored as Category;
  }
  return "meat";
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

export function SettingsPanel() {
  const [defaultCategory, setDefaultCategory] = useState<Category>(getDefaultCategory);
  const [dateFormat, setDateFormat] = useState<DateFormat>(getDateFormat);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(getWeightUnit);

  useEffect(() => {
    localStorage.setItem("defaultCategory", defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    localStorage.setItem("dateFormat", dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem("weightUnit", weightUnit);
  }, [weightUnit]);

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
