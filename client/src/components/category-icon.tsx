import { 
  Beef, 
  Carrot, 
  Apple,
  Salad,
  UtensilsCrossed, 
  Snowflake,
  Package,
  IceCream,
  Croissant,
  Drumstick,
  Fish,
  Shell,
  Ham,
  Milk,
  Tag
} from "lucide-react";
import { Home, ShoppingBag, Pizza } from "lucide-react";
import type { Category, MeatSubcategory, ProduceSubcategory, PreparedMealsSubcategory, FrozenGoodsSubcategory } from "@shared/schema";

type CategoryConfig = { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string };

const categoryConfig: Record<Category, CategoryConfig> = {
  meat_fish: { icon: Beef, label: "Meat & Fish", color: "text-red-500 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-500" },
  produce: { icon: Carrot, label: "Fruit & Veg", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-500" },
  prepared_meals: { icon: UtensilsCrossed, label: "Ready Meals", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-500" },
  frozen_goods: { icon: Snowflake, label: "Frozen Goods", color: "text-cyan-500 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-500" },
  dairy: { icon: Milk, label: "Dairy", color: "text-sky-500 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/30", stripeColor: "bg-sky-500" },
  desserts: { icon: IceCream, label: "Desserts", color: "text-pink-500 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-500" },
  bread: { icon: Croissant, label: "Bread", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-600" },
  other: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-500" },
};

const customCategoryConfig: CategoryConfig = { 
  icon: Tag, 
  label: "Custom", 
  color: "text-violet-500 dark:text-violet-400", 
  bgColor: "bg-violet-100 dark:bg-violet-900/30", 
  stripeColor: "bg-violet-500" 
};

export function getCategoryConfig(category: string): CategoryConfig {
  if (category in categoryConfig) {
    return categoryConfig[category as Category];
  }
  return customCategoryConfig;
}

const meatSubcategoryConfig: Record<MeatSubcategory, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  chicken: { icon: Drumstick, label: "Poultry", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-500" },
  beef: { icon: Beef, label: "Beef", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-600" },
  pork: { icon: Ham, label: "Pork", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-600" },
  lamb: { icon: Beef, label: "Lamb", color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-100 dark:bg-rose-900/30", stripeColor: "bg-rose-600" },
  fish: { icon: Fish, label: "Fish", color: "text-blue-500 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", stripeColor: "bg-blue-500" },
  seafood: { icon: Shell, label: "Seafood", color: "text-teal-500 dark:text-teal-400", bgColor: "bg-teal-100 dark:bg-teal-900/30", stripeColor: "bg-teal-500" },
  other_meat: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-500" },
};

const produceSubcategoryConfig: Record<ProduceSubcategory, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  fruit: { icon: Apple, label: "Fruit", color: "text-red-500 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-500" },
  vegetable: { icon: Salad, label: "Veg", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", stripeColor: "bg-green-600" },
};

const preparedMealsSubcategoryConfig: Record<PreparedMealsSubcategory, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  home_made: { icon: Home, label: "Home Made", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-600" },
  store_bought: { icon: ShoppingBag, label: "Store Bought", color: "text-purple-500 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30", stripeColor: "bg-purple-500" },
};

const frozenGoodsSubcategoryConfig: Record<FrozenGoodsSubcategory, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  pizza: { icon: Pizza, label: "Pizzas", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-500" },
  pasta: { icon: UtensilsCrossed, label: "Pasta", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", stripeColor: "bg-yellow-600" },
  other_frozen: { icon: Snowflake, label: "Other", color: "text-cyan-500 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-500" },
};

interface CategoryIconProps {
  category: string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "default";
}

export function CategoryIcon({ category, showLabel = false, className = "", size = "default" }: CategoryIconProps) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className={`${iconSize} ${config.color}`} />
      {showLabel && <span className="text-sm text-muted-foreground">{config.label}</span>}
    </div>
  );
}

export function getCategoryLabel(category: string): string {
  try {
    const stored = localStorage.getItem("categoryLabels");
    if (stored) {
      const labels = JSON.parse(stored);
      if (labels[category]) return labels[category];
    }
    const customStored = localStorage.getItem("customCategories");
    if (customStored) {
      const customCats = JSON.parse(customStored);
      const found = customCats.find((c: { id: string; name: string }) => c.id === category);
      if (found) return found.name;
    }
  } catch {
    // ignore
  }
  const config = getCategoryConfig(category);
  return config.label;
}

export { categoryConfig, meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig, customCategoryConfig };
