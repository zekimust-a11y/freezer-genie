import { useState } from "react";
import { categoryConfig, meatSubcategoryConfig } from "@/components/category-icon";
import { categories, meatSubcategories, type Category, type MeatSubcategory } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | null;
  selectedSubcategory: MeatSubcategory | null;
  onCategoryChange: (category: Category | null) => void;
  onSubcategoryChange: (subcategory: MeatSubcategory | null) => void;
}

export function CategoryFilter({ 
  selectedCategory, 
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange
}: CategoryFilterProps) {
  const [showMeatSubmenu, setShowMeatSubmenu] = useState(false);

  const handleCategoryClick = (category: Category) => {
    if (category === "meat_fish") {
      if (selectedCategory === "meat_fish" && !showMeatSubmenu) {
        onCategoryChange(null);
        onSubcategoryChange(null);
      } else {
        onCategoryChange("meat_fish");
        setShowMeatSubmenu(true);
      }
    } else {
      onCategoryChange(selectedCategory === category ? null : category);
      onSubcategoryChange(null);
      setShowMeatSubmenu(false);
    }
  };

  const handleSubcategoryClick = (subcategory: MeatSubcategory) => {
    onSubcategoryChange(selectedSubcategory === subcategory ? null : subcategory);
  };

  const handleBackToCategories = () => {
    setShowMeatSubmenu(false);
    onSubcategoryChange(null);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide" data-testid="category-filter-container">
      <AnimatePresence mode="wait">
        {showMeatSubmenu ? (
          <motion.div
            key="submenu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 backdrop-blur-sm bg-background/80 rounded-xl p-1 min-w-max"
          >
            <motion.button
              onClick={handleBackToCategories}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors text-muted-foreground"
              data-testid="button-back-categories"
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 rounded-md bg-muted">
                <ChevronLeft className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">Back</span>
            </motion.button>

            {meatSubcategories.map((subcategory) => {
              const config = meatSubcategoryConfig[subcategory];
              const Icon = config.icon;
              const isActive = selectedSubcategory === subcategory;

              return (
                <motion.button
                  key={subcategory}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "" 
                      : "text-muted-foreground"
                  }`}
                  data-testid={`button-filter-${subcategory}`}
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
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 backdrop-blur-sm bg-background/80 rounded-xl p-1 min-w-max"
          >
            {categories.map((category) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              const isActive = selectedCategory === category;

              return (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
