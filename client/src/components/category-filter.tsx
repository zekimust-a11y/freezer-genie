import { useState } from "react";
import { getCategoryConfig, meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig, getCategoryLabel } from "@/components/category-icon";
import { meatSubcategories, produceSubcategories, preparedMealsSubcategories, frozenGoodsSubcategories, type Category, type MeatSubcategory, type ProduceSubcategory, type PreparedMealsSubcategory, type FrozenGoodsSubcategory } from "@shared/schema";
import { getVisibleCategories, getCustomCategories, getHiddenCategories } from "@/components/settings-panel";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string | null;
  selectedSubcategory: MeatSubcategory | ProduceSubcategory | PreparedMealsSubcategory | FrozenGoodsSubcategory | null;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: MeatSubcategory | ProduceSubcategory | PreparedMealsSubcategory | FrozenGoodsSubcategory | null) => void;
}

export function CategoryFilter({ 
  selectedCategory, 
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange
}: CategoryFilterProps) {
  const [showSubmenu, setShowSubmenu] = useState<"meat" | "produce" | "prepared_meals" | "frozen_goods" | null>(null);
  const visibleCategories = getVisibleCategories();
  const customCategories = getCustomCategories();
  const hiddenCategories = getHiddenCategories();
  const visibleCustomCategories = customCategories.filter(c => !hiddenCategories.includes(c.id as Category));

  const handleCategoryClick = (category: string) => {
    if (category === "meat_fish") {
      if (selectedCategory === "meat_fish" && showSubmenu !== "meat") {
        onCategoryChange(null);
        onSubcategoryChange(null);
      } else {
        onCategoryChange("meat_fish");
        setShowSubmenu("meat");
      }
    } else if (category === "produce") {
      if (selectedCategory === "produce" && showSubmenu !== "produce") {
        onCategoryChange(null);
        onSubcategoryChange(null);
      } else {
        onCategoryChange("produce");
        setShowSubmenu("produce");
      }
    } else if (category === "prepared_meals") {
      if (selectedCategory === "prepared_meals" && showSubmenu !== "prepared_meals") {
        onCategoryChange(null);
        onSubcategoryChange(null);
      } else {
        onCategoryChange("prepared_meals");
        setShowSubmenu("prepared_meals");
      }
    } else if (category === "frozen_goods") {
      if (selectedCategory === "frozen_goods" && showSubmenu !== "frozen_goods") {
        onCategoryChange(null);
        onSubcategoryChange(null);
      } else {
        onCategoryChange("frozen_goods");
        setShowSubmenu("frozen_goods");
      }
    } else {
      onCategoryChange(selectedCategory === category ? null : category);
      onSubcategoryChange(null);
      setShowSubmenu(null);
    }
  };

  const handleMeatSubcategoryClick = (subcategory: MeatSubcategory) => {
    onSubcategoryChange(selectedSubcategory === subcategory ? null : subcategory);
  };

  const handleProduceSubcategoryClick = (subcategory: ProduceSubcategory) => {
    onSubcategoryChange(selectedSubcategory === subcategory ? null : subcategory);
  };

  const handlePreparedMealsSubcategoryClick = (subcategory: PreparedMealsSubcategory) => {
    onSubcategoryChange(selectedSubcategory === subcategory ? null : subcategory);
  };

  const handleFrozenGoodsSubcategoryClick = (subcategory: FrozenGoodsSubcategory) => {
    onSubcategoryChange(selectedSubcategory === subcategory ? null : subcategory);
  };

  const handleBackToCategories = () => {
    setShowSubmenu(null);
    onSubcategoryChange(null);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4" data-testid="category-filter-container">
      <div className="flex justify-center min-w-max">
        <AnimatePresence mode="wait">
        {showSubmenu === "meat" ? (
          <motion.div
            key="meat-submenu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-xl p-1.5 min-w-max"
          >
            <motion.button
              onClick={handleBackToCategories}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors text-muted-foreground"
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
                  onClick={() => handleMeatSubcategoryClick(subcategory)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
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
        ) : showSubmenu === "produce" ? (
          <motion.div
            key="produce-submenu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-xl p-1.5 min-w-max"
          >
            <motion.button
              onClick={handleBackToCategories}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors text-muted-foreground"
              data-testid="button-back-categories"
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 rounded-md bg-muted">
                <ChevronLeft className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">Back</span>
            </motion.button>

            {produceSubcategories.map((subcategory) => {
              const config = produceSubcategoryConfig[subcategory];
              const Icon = config.icon;
              const isActive = selectedSubcategory === subcategory;

              return (
                <motion.button
                  key={subcategory}
                  onClick={() => handleProduceSubcategoryClick(subcategory)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
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
        ) : showSubmenu === "prepared_meals" ? (
          <motion.div
            key="prepared-meals-submenu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-xl p-1.5 min-w-max"
          >
            <motion.button
              onClick={handleBackToCategories}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors text-muted-foreground"
              data-testid="button-back-categories"
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 rounded-md bg-muted">
                <ChevronLeft className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">Back</span>
            </motion.button>

            {preparedMealsSubcategories.map((subcategory) => {
              const config = preparedMealsSubcategoryConfig[subcategory];
              const Icon = config.icon;
              const isActive = selectedSubcategory === subcategory;

              return (
                <motion.button
                  key={subcategory}
                  onClick={() => handlePreparedMealsSubcategoryClick(subcategory)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
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
        ) : showSubmenu === "frozen_goods" ? (
          <motion.div
            key="frozen_goods"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-xl p-1.5 min-w-max"
          >
            <motion.button
              onClick={handleBackToCategories}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors text-muted-foreground"
              data-testid="button-back-categories"
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 rounded-md bg-muted">
                <ChevronLeft className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">Back</span>
            </motion.button>

            {frozenGoodsSubcategories.map((subcategory) => {
              const config = frozenGoodsSubcategoryConfig[subcategory];
              const Icon = config.icon;
              const isActive = selectedSubcategory === subcategory;

              return (
                <motion.button
                  key={subcategory}
                  onClick={() => handleFrozenGoodsSubcategoryClick(subcategory)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
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
            className="flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-xl p-1.5 min-w-max"
          >
            {visibleCategories.map((category) => {
              const config = getCategoryConfig(category);
              const Icon = config.icon;
              const isActive = selectedCategory === category;

              return (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
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
                    {getCategoryLabel(category)}
                  </span>
                </motion.button>
              );
            })}
            {visibleCustomCategories.map((customCat) => {
              const config = getCategoryConfig(customCat.id);
              const Icon = config.icon;
              const isActive = selectedCategory === customCat.id;

              return (
                <motion.button
                  key={customCat.id}
                  onClick={() => handleCategoryClick(customCat.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "" 
                      : "text-muted-foreground"
                  }`}
                  data-testid={`button-filter-${customCat.id}`}
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
                    {customCat.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
