import { 
  Beef, 
  Apple, 
  UtensilsCrossed, 
  Snowflake,
  Package,
  IceCream,
  Croissant,
  Bird,
  Fish,
  Shell,
  Drumstick
} from "lucide-react";
import type { Category, MeatSubcategory } from "@shared/schema";

const categoryConfig: Record<Category, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  meat_fish: { icon: Beef, label: "Meat & Fish", color: "text-red-500 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-500" },
  produce: { icon: Apple, label: "Fruit & Veg", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", stripeColor: "bg-green-500" },
  prepared_meals: { icon: UtensilsCrossed, label: "Ready Meals", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-500" },
  frozen_goods: { icon: Snowflake, label: "Frozen Goods", color: "text-cyan-500 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-500" },
  desserts: { icon: IceCream, label: "Desserts", color: "text-pink-500 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-500" },
  bread: { icon: Croissant, label: "Bread", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-600" },
  other: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-500" },
};

const meatSubcategoryConfig: Record<MeatSubcategory, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  chicken: { icon: Bird, label: "Chicken", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-500" },
  beef: { icon: Beef, label: "Beef", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-600" },
  pork: { icon: Drumstick, label: "Pork", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30", stripeColor: "bg-pink-600" },
  lamb: { icon: Beef, label: "Lamb", color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-100 dark:bg-rose-900/30", stripeColor: "bg-rose-600" },
  fish: { icon: Fish, label: "Fish", color: "text-blue-500 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", stripeColor: "bg-blue-500" },
  seafood: { icon: Shell, label: "Seafood", color: "text-teal-500 dark:text-teal-400", bgColor: "bg-teal-100 dark:bg-teal-900/30", stripeColor: "bg-teal-500" },
  other_meat: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-500" },
};

interface CategoryIconProps {
  category: Category;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "default";
}

export function CategoryIcon({ category, showLabel = false, className = "", size = "default" }: CategoryIconProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className={`${iconSize} ${config.color}`} />
      {showLabel && <span className="text-sm text-muted-foreground">{config.label}</span>}
    </div>
  );
}

export function getCategoryLabel(category: Category): string {
  try {
    const stored = localStorage.getItem("categoryLabels");
    if (stored) {
      const labels = JSON.parse(stored);
      if (labels[category]) return labels[category];
    }
  } catch {
    // ignore
  }
  return categoryConfig[category].label;
}

export { categoryConfig, meatSubcategoryConfig };
