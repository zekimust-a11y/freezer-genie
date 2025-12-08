import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";
import { CategoryIcon, getCategoryLabel, categoryConfig } from "@/components/category-icon";
import { ExpirationBadge } from "@/components/expiration-badge";
import { getDateFormat } from "@/components/settings-panel";
import { locationLabels, type FreezerItem } from "@shared/schema";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

interface FreezerItemCardProps {
  item: FreezerItem;
  onEdit: (item: FreezerItem) => void;
  index?: number;
}

const weightUnits = ["lb", "kg", "oz", "g"];

function ExpirationRing({ expirationDate }: { expirationDate: string }) {
  const expiry = parseISO(expirationDate);
  
  if (!isValid(expiry)) {
    return null;
  }
  
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiry, today);
  
  const maxDays = 90;
  const percentage = Math.max(0, Math.min(100, ((maxDays - daysUntilExpiry) / maxDays) * 100));
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let strokeColor = "stroke-green-500";
  if (daysUntilExpiry <= 3) strokeColor = "stroke-red-500";
  else if (daysUntilExpiry <= 7) strokeColor = "stroke-amber-500";
  else if (daysUntilExpiry <= 14) strokeColor = "stroke-yellow-500";

  return (
    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        className="stroke-muted/30"
        strokeWidth="3"
      />
      <motion.circle
        cx="22"
        cy="22"
        r="18"
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
  const isWeightUnit = weightUnits.includes(item.unit);
  const hasLocation = item.location && item.location !== "unassigned";
  const config = categoryConfig[item.category];

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
          
          <CardContent className="p-4 flex-1">
            {/* Top: Name, quantity, and category icon with ring */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 
                    className="font-semibold text-base"
                    data-testid={`text-item-name-${item.id}`}
                  >
                    {item.name}
                  </h3>
                  {isLowStock && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Low
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    x {item.quantity}{isWeightUnit && ` ${item.unit}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
              </div>
              
              {/* Category icon with expiration ring */}
              <div className="relative w-11 h-11 shrink-0">
                {item.expirationDate && (
                  <ExpirationRing expirationDate={item.expirationDate} />
                )}
                <div className={`absolute inset-0 flex items-center justify-center rounded-full ${config.bgColor}`}>
                  <CategoryIcon category={item.category} />
                </div>
              </div>
            </div>

            {/* Middle: Notes */}
            {item.notes && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2 pl-0.5">
                {item.notes}
              </p>
            )}

            {/* Bottom: Expiration and location */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {item.expirationDate ? (
                <div className="flex items-center gap-2">
                  <ExpirationBadge expirationDate={item.expirationDate} />
                  {formattedDate && (
                    <span className="text-xs text-muted-foreground">
                      {formattedDate}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">No expiry set</span>
              )}
              
              {hasLocation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{locationLabels[item.location as keyof typeof locationLabels] || item.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
