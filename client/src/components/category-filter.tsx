import { categoryConfig } from "@/components/category-icon";
import { categories, type Category } from "@shared/schema";
import { LayoutGrid } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-center gap-3 overflow-x-auto" data-testid="category-filter-container">
      <button
        onClick={() => onCategoryChange(null)}
        className={`flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-xl transition-all ${
          selectedCategory === null 
            ? "bg-primary/15 text-primary" 
            : "text-muted-foreground"
        }`}
        data-testid="button-filter-all"
      >
        <div className={`p-2 rounded-lg ${selectedCategory === null ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <LayoutGrid className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-medium">All</span>
      </button>
      {categories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(isActive ? null : category)}
            className={`flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-xl transition-all ${
              isActive 
                ? "bg-primary/15" 
                : "text-muted-foreground"
            }`}
            data-testid={`button-filter-${category}`}
          >
            <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Icon className={`h-6 w-6 ${isActive ? "" : config.color}`} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
              {config.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
