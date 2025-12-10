import { categoryConfig } from "@/components/category-icon";
import { categories, type Category } from "@shared/schema";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide" data-testid="category-filter-container">
      <div className="flex items-center gap-1 backdrop-blur-sm bg-background/80 rounded-xl p-1 min-w-max">
        {categories.map((category) => {
          const config = categoryConfig[category];
          const Icon = config.icon;
          const isActive = selectedCategory === category;

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(isActive ? null : category)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "" 
                  : "text-muted-foreground"
              }`}
              data-testid={`button-filter-${category}`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-2 rounded-md transition-all ${
                isActive 
                  ? `${config.stripeColor} text-white shadow-md` 
                  : config.bgColor
              }`}>
                <Icon className={`h-7 w-7 ${isActive ? "text-white" : config.color}`} />
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
