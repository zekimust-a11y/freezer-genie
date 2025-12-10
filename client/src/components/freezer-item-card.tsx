import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";
import { CategoryIcon, getCategoryLabel, getCategoryConfig } from "@/components/category-icon";
import { ExpirationBadge } from "@/components/expiration-badge";
import { getDateFormat, getTagLabel } from "@/components/settings-panel";
import { type FreezerItem, type Location } from "@shared/schema";
import { getLocationLabel } from "@/components/settings-panel";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

const unitLabels: Record<string, { singular: string; plural: string }> = {
  item: { singular: "item", plural: "items" },
  piece: { singular: "piece", plural: "pieces" },
  portion: { singular: "portion", plural: "portions" },
  lb: { singular: "lb", plural: "lbs" },
  kg: { singular: "kg", plural: "kg" },
  oz: { singular: "oz", plural: "oz" },
  g: { singular: "g", plural: "g" },
  bag: { singular: "bag", plural: "bags" },
  box: { singular: "box", plural: "boxes" },
  pack: { singular: "pack", plural: "packs" },
  container: { singular: "container", plural: "containers" },
};

export function getUnitLabel(unit: string, quantity: number): string {
  const labels = unitLabels[unit];
  if (labels) {
    return quantity === 1 ? labels.singular : labels.plural;
  }
  return unit;
}

export function formatQuantity(quantity: number | string): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, '');
}

interface FreezerItemCardProps {
  item: FreezerItem;
  onEdit: (item: FreezerItem) => void;
  index?: number;
}


function ExpirationRing({ expirationDate }: { expirationDate: string }) {
  const expiry = parseISO(expirationDate);
  
  if (!isValid(expiry)) {
    return null;
  }
  
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiry, today);
  
  const maxDays = 90;
  const percentage = Math.max(0, Math.min(100, ((maxDays - daysUntilExpiry) / maxDays) * 100));
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let strokeColor = "stroke-green-500";
  if (daysUntilExpiry <= 3) strokeColor = "stroke-red-500";
  else if (daysUntilExpiry <= 7) strokeColor = "stroke-amber-500";
  else if (daysUntilExpiry <= 14) strokeColor = "stroke-yellow-500";

  return (
    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        className="stroke-muted/30"
        strokeWidth="3"
      />
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        className={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

export function FreezerItemCard({ item, onEdit, index = 0 }: FreezerItemCardProps) {
  const formattedDate = item.expirationDate && isValid(parseISO(item.expirationDate))
    ? format(parseISO(item.expirationDate), getDateFormat())
    : null;

  const isLowStock = (item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0);
  const hasLocation = item.location && item.location !== "unassigned";
  const config = getCategoryConfig(item.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
    >
      <Card 
        className="cursor-pointer hover-elevate transition-all shadow-md border overflow-hidden"
        onClick={() => onEdit(item)}
        data-testid={`card-freezer-item-${item.id}`}
      >
        <div className="flex">
          {/* Category color stripe */}
          <div className={`w-1.5 ${config.stripeColor} shrink-0`} />
          
          <CardContent className="p-2.5 flex-1">
            {/* Top: Name, quantity, and category icon with ring */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 
                    className="font-semibold text-sm"
                    data-testid={`text-item-name-${item.id}`}
                  >
                    {item.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    x {formatQuantity(item.quantity)} {getUnitLabel(item.unit, typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity)}
                  </span>
                </div>
              </div>
              
              {/* Category icon with expiration ring */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-9 h-9">
                  {item.expirationDate && (
                    <ExpirationRing expirationDate={item.expirationDate} />
                  )}
                  <div className={`absolute inset-0 flex items-center justify-center rounded-full ${config.bgColor}`}>
                    <CategoryIcon category={item.category} />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {getCategoryLabel(item.category)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.notes}
              </p>
            )}
            {/* Location */}
            {hasLocation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 mb-1">
                <MapPin className="h-3 w-3" />
                <span>{getLocationLabel(item.location as Location)}</span>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 mb-1">
                {item.tags.map((tagId) => (
                  <Badge 
                    key={tagId} 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0"
                    data-testid={`badge-tag-${tagId}`}
                  >
                    {getTagLabel(tagId)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Bottom: Low stock and expiration */}
            <div className="flex flex-col gap-1">
              {isLowStock && (
                <Badge variant="destructive" className="text-xs gap-1 w-fit">
                  <AlertCircle className="h-3 w-3" />
                  Low Stock
                </Badge>
              )}
              {item.expirationDate && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <ExpirationBadge expirationDate={item.expirationDate} />
                  {formattedDate && (
                    <span className="text-xs text-muted-foreground">
                      Use by: {formattedDate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
