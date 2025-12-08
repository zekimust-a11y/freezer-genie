import { 
  Beef, 
  Carrot, 
  Apple, 
  UtensilsCrossed, 
  Milk, 
  Package
} from "lucide-react";
import type { Category } from "@shared/schema";

const categoryConfig: Record<Category, { icon: typeof Beef; label: string; color: string }> = {
  meat: { icon: Beef, label: "Meat", color: "text-red-500 dark:text-red-400" },
  vegetables: { icon: Carrot, label: "Vegetables", color: "text-green-600 dark:text-green-400" },
  fruits: { icon: Apple, label: "Fruits", color: "text-orange-500 dark:text-orange-400" },
  prepared_meals: { icon: UtensilsCrossed, label: "Prepared Meals", color: "text-amber-600 dark:text-amber-400" },
  dairy: { icon: Milk, label: "Dairy", color: "text-blue-500 dark:text-blue-400" },
  other: { icon: Package, label: "Other", color: "text-gray-500 dark:text-gray-400" },
};

interface CategoryIconProps {
  category: Category;
  showLabel?: boolean;
  className?: string;
}

export function CategoryIcon({ category, showLabel = false, className = "" }: CategoryIconProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      {showLabel && <span className="text-sm text-muted-foreground">{config.label}</span>}
    </div>
  );
}

export function getCategoryLabel(category: Category): string {
  return categoryConfig[category].label;
}

export { categoryConfig };
