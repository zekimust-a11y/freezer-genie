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
  Fish,
  Ham,
  Milk,
  Tag,
  type LucideIcon
} from "lucide-react";
import { Home, ShoppingBag, Pizza } from "lucide-react";
import { GiRoastChicken, GiMeat, GiShrimp } from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Category, MeatSubcategory, ProduceSubcategory, PreparedMealsSubcategory, FrozenGoodsSubcategory, DessertsSubcategory } from "@shared/schema";

type CategoryConfig = { icon: LucideIcon | IconType; label: string; color: string; bgColor: string; stripeColor: string };

const categoryConfig: Record<Category, CategoryConfig> = {
  meat_fish: { icon: Beef, label: "Meat & Fish", color: "text-red-400 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-300 dark:bg-red-400" },
  produce: { icon: Carrot, label: "Fruit & Veg", color: "text-green-400 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/30", stripeColor: "bg-green-300 dark:bg-green-400" },
  prepared_meals: { icon: UtensilsCrossed, label: "Ready Meals", color: "text-violet-400 dark:text-violet-300", bgColor: "bg-violet-100 dark:bg-violet-900/30", stripeColor: "bg-violet-300 dark:bg-violet-400" },
  frozen_goods: { icon: Snowflake, label: "Frozen Goods", color: "text-cyan-400 dark:text-cyan-300", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-300 dark:bg-cyan-400" },
  dairy: { icon: Milk, label: "Dairy", color: "text-sky-400 dark:text-sky-300", bgColor: "bg-sky-100 dark:bg-sky-900/30", stripeColor: "bg-sky-300 dark:bg-sky-400" },
  desserts: { icon: IceCream, label: "Desserts", color: "text-pink-400 dark:text-pink-300", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-300 dark:bg-pink-400" },
  bread: { icon: Croissant, label: "Bread", color: "text-amber-400 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-300 dark:bg-amber-400" },
  other: { icon: Package, label: "Other", color: "text-gray-400 dark:text-gray-300", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-300 dark:bg-gray-400" },
};

const customCategoryConfig: CategoryConfig = { 
  icon: Tag, 
  label: "Custom", 
  color: "text-violet-400 dark:text-violet-300", 
  bgColor: "bg-violet-100 dark:bg-violet-900/30", 
  stripeColor: "bg-violet-300 dark:bg-violet-400" 
};

export function getCategoryConfig(category: string): CategoryConfig {
  if (category in categoryConfig) {
    return categoryConfig[category as Category];
  }
  return customCategoryConfig;
}

export function getItemConfig(category: string, subCategory?: string | null): CategoryConfig {
  // If there's a subcategory, try to get its config
  if (subCategory) {
    if (category === 'meat_fish' && subCategory in meatSubcategoryConfig) {
      return meatSubcategoryConfig[subCategory as MeatSubcategory];
    }
    if (category === 'produce' && subCategory in produceSubcategoryConfig) {
      return produceSubcategoryConfig[subCategory as ProduceSubcategory];
    }
    if (category === 'prepared_meals' && subCategory in preparedMealsSubcategoryConfig) {
      return preparedMealsSubcategoryConfig[subCategory as PreparedMealsSubcategory];
    }
    if (category === 'frozen_goods' && subCategory in frozenGoodsSubcategoryConfig) {
      return frozenGoodsSubcategoryConfig[subCategory as FrozenGoodsSubcategory];
    }
    if (category === 'desserts' && subCategory in dessertsSubcategoryConfig) {
      return dessertsSubcategoryConfig[subCategory as DessertsSubcategory];
    }
  }
  // Fall back to category config
  return getCategoryConfig(category);
}

const meatSubcategoryConfig: Record<MeatSubcategory, CategoryConfig> = {
  chicken: { icon: GiRoastChicken, label: "Poultry", color: "text-orange-400 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-300 dark:bg-orange-400" },
  beef: { icon: Beef, label: "Beef", color: "text-red-400 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-300 dark:bg-red-400" },
  pork: { icon: Ham, label: "Pork", color: "text-pink-400 dark:text-pink-300", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-300 dark:bg-pink-400" },
  lamb: { icon: GiMeat, label: "Lamb", color: "text-rose-400 dark:text-rose-300", bgColor: "bg-rose-100 dark:bg-rose-900/30", stripeColor: "bg-rose-300 dark:bg-rose-400" },
  fish: { icon: Fish, label: "Fish", color: "text-blue-400 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900/30", stripeColor: "bg-blue-300 dark:bg-blue-400" },
  seafood: { icon: GiShrimp, label: "Seafood", color: "text-teal-400 dark:text-teal-300", bgColor: "bg-teal-100 dark:bg-teal-900/30", stripeColor: "bg-teal-300 dark:bg-teal-400" },
  other_meat: { icon: Package, label: "Other", color: "text-gray-400 dark:text-gray-300", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-300 dark:bg-gray-400" },
};

const produceSubcategoryConfig: Record<ProduceSubcategory, CategoryConfig> = {
  fruit: { icon: Apple, label: "Fruit", color: "text-red-400 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-300 dark:bg-red-400" },
  vegetable: { icon: Salad, label: "Veg", color: "text-green-400 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/30", stripeColor: "bg-green-300 dark:bg-green-400" },
};

const preparedMealsSubcategoryConfig: Record<PreparedMealsSubcategory, CategoryConfig> = {
  home_made: { icon: Home, label: "Home Made", color: "text-amber-400 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-300 dark:bg-amber-400" },
  store_bought: { icon: ShoppingBag, label: "Store Bought", color: "text-purple-400 dark:text-purple-300", bgColor: "bg-purple-100 dark:bg-purple-900/30", stripeColor: "bg-purple-300 dark:bg-purple-400" },
};

const frozenGoodsSubcategoryConfig: Record<FrozenGoodsSubcategory, CategoryConfig> = {
  pizza: { icon: Pizza, label: "Pizzas", color: "text-orange-400 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-300 dark:bg-orange-400" },
  pasta: { icon: UtensilsCrossed, label: "Pasta", color: "text-yellow-400 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", stripeColor: "bg-yellow-300 dark:bg-yellow-400" },
  pastry: { icon: Croissant, label: "Pastry", color: "text-amber-400 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-300 dark:bg-amber-400" },
  other_frozen: { icon: Snowflake, label: "Other", color: "text-cyan-400 dark:text-cyan-300", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-300 dark:bg-cyan-400" },
};

const dessertsSubcategoryConfig: Record<DessertsSubcategory, CategoryConfig> = {
  home_made: { icon: Home, label: "Home Made", color: "text-pink-400 dark:text-pink-300", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-300 dark:bg-pink-400" },
  store_bought: { icon: ShoppingBag, label: "Store Bought", color: "text-purple-400 dark:text-purple-300", bgColor: "bg-purple-100 dark:bg-purple-900/30", stripeColor: "bg-purple-300 dark:bg-purple-400" },
  cakes: { icon: IceCream, label: "Cakes", color: "text-rose-400 dark:text-rose-300", bgColor: "bg-rose-100 dark:bg-rose-900/30", stripeColor: "bg-rose-300 dark:bg-rose-400" },
  sauces: { icon: Package, label: "Sauces", color: "text-amber-400 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-300 dark:bg-amber-400" },
};

interface CategoryIconProps {
  category: string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function CategoryIcon({ category, showLabel = false, className = "", size = "default" }: CategoryIconProps) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4";

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

export function getSubcategoryLabel(category: string, subCategory: string | null | undefined): string | null {
  if (!subCategory) return null;
  
  if (category === 'meat_fish' && subCategory in meatSubcategoryConfig) {
    return meatSubcategoryConfig[subCategory as MeatSubcategory].label;
  }
  if (category === 'produce' && subCategory in produceSubcategoryConfig) {
    return produceSubcategoryConfig[subCategory as ProduceSubcategory].label;
  }
  if (category === 'prepared_meals' && subCategory in preparedMealsSubcategoryConfig) {
    return preparedMealsSubcategoryConfig[subCategory as PreparedMealsSubcategory].label;
  }
  if (category === 'frozen_goods' && subCategory in frozenGoodsSubcategoryConfig) {
    return frozenGoodsSubcategoryConfig[subCategory as FrozenGoodsSubcategory].label;
  }
  if (category === 'desserts' && subCategory in dessertsSubcategoryConfig) {
    return dessertsSubcategoryConfig[subCategory as DessertsSubcategory].label;
  }
  return null;
}

export { categoryConfig, meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig, dessertsSubcategoryConfig, customCategoryConfig };
