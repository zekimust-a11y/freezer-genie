import { categoryConfig } from "@/components/category-icon";
import { categories, type Category } from "@shared/schema";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-between w-full backdrop-blur-sm bg-background/80 rounded-xl p-1" data-testid="category-filter-container">
      <motion.button
        onClick={() => onCategoryChange(null)}
        className={`flex flex-col items-center gap-0.5 flex-1 p-1 rounded-lg transition-colors ${
          selectedCategory === null 
            ? "text-primary" 
            : "text-muted-foreground"
        }`}
        data-testid="button-filter-all"
        whileTap={{ scale: 0.95 }}
      >
        <div className={`p-1.5 rounded-md transition-all ${
          selectedCategory === null 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "bg-muted/50"
        }`}>
          <LayoutGrid className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-medium">All</span>
      </motion.button>
      {categories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const isActive = selectedCategory === category;

        return (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(isActive ? null : category)}
            className={`flex flex-col items-center gap-0.5 flex-1 p-1 rounded-lg transition-colors ${
              isActive 
                ? "" 
                : "text-muted-foreground"
            }`}
            data-testid={`button-filter-${category}`}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`p-1.5 rounded-md transition-all ${
              isActive 
                ? `${config.stripeColor} text-white shadow-md` 
                : config.bgColor
            }`}>
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : config.color}`} />
            </div>
            <span className={`text-[9px] font-medium ${isActive ? config.color : ""}`}>
              {config.label.split(" ")[0]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
