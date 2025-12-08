import { 
  Beef, 
  Carrot, 
  Apple, 
  UtensilsCrossed, 
  Snowflake,
  Package
} from "lucide-react";
import type { Category } from "@shared/schema";

const categoryConfig: Record<Category, { icon: typeof Beef; label: string; color: string; bgColor: string; stripeColor: string }> = {
  meat: { icon: Beef, label: "Meat", color: "text-red-500 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", stripeColor: "bg-red-500" },
  vegetables: { icon: Carrot, label: "Vegetables", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", stripeColor: "bg-green-500" },
  fruits: { icon: Apple, label: "Fruits", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", stripeColor: "bg-orange-500" },
  prepared_meals: { icon: UtensilsCrossed, label: "Prepared Meals", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", stripeColor: "bg-amber-500" },
  frozen_goods: { icon: Snowflake, label: "Frozen Goods", color: "text-cyan-500 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", stripeColor: "bg-cyan-500" },
  other: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800/30", stripeColor: "bg-gray-500" },
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
  return categoryConfig[category].label;
}

export { categoryConfig };
