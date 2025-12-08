import { Button } from "@/components/ui/button";
import { categoryConfig } from "@/components/category-icon";
import { categories, type Category } from "@shared/schema";
import { X } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="category-filter-container">
      <Button
        variant={selectedCategory === null ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        data-testid="button-filter-all"
      >
        All
      </Button>
      {categories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const isActive = selectedCategory === category;

        return (
          <Button
            key={category}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(isActive ? null : category)}
            className="gap-1.5"
            data-testid={`button-filter-${category}`}
          >
            <Icon className={`h-4 w-4 ${config.color}`} />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
      {selectedCategory && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="text-muted-foreground"
          data-testid="button-clear-filter"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
