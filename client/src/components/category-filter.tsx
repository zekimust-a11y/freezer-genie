import { categoryConfig } from "@/components/category-icon";
import { categories, type Category } from "@shared/schema";
import { LayoutGrid } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-center gap-1" data-testid="category-filter-container">
      <button
        onClick={() => onCategoryChange(null)}
        className={`flex flex-col items-center gap-0.5 min-w-[48px] p-1.5 rounded-lg transition-all ${
          selectedCategory === null 
            ? "bg-primary/15 text-primary" 
            : "text-muted-foreground"
        }`}
        data-testid="button-filter-all"
      >
        <div className={`p-1.5 rounded-md ${selectedCategory === null ? "bg-orange-500 text-white" : "bg-orange-100 dark:bg-orange-900/30"}`}>
          <LayoutGrid className="h-5 w-5" />
        </div>
        <span className="text-[9px] font-medium">All</span>
      </button>
      {categories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(isActive ? null : category)}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] p-1.5 rounded-lg transition-all ${
              isActive 
                ? "bg-primary/15" 
                : "text-muted-foreground"
            }`}
            data-testid={`button-filter-${category}`}
          >
            <div className={`p-1.5 rounded-md ${isActive ? "bg-orange-500 text-white" : "bg-orange-100 dark:bg-orange-900/30"}`}>
              <Icon className={`h-5 w-5 ${isActive ? "" : config.color}`} />
            </div>
            <span className={`text-[9px] font-medium ${isActive ? "text-primary" : ""}`}>
              {config.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
