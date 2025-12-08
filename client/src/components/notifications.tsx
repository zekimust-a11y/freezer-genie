import { useState, useMemo, useEffect } from "react";
import { Bell, Clock, ShoppingCart, X, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "@/components/category-icon";
import type { FreezerItem } from "@shared/schema";
import { differenceInDays, parseISO, isValid, isPast, isToday } from "date-fns";

interface NotificationsProps {
  items: FreezerItem[];
  onNavigateToItem?: (item: FreezerItem) => void;
}

type NotificationType = "expiring" | "expired" | "low_stock";

interface Notification {
  id: string;
  type: NotificationType;
  item: FreezerItem;
  message: string;
  priority: number;
}

function getDismissedNotifications(): Set<string> {
  try {
    const stored = localStorage.getItem("dismissedNotifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const validEntries = Object.entries(parsed).filter(
        ([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000
      );
      if (validEntries.length !== Object.keys(parsed).length) {
        const cleaned = Object.fromEntries(validEntries);
        localStorage.setItem("dismissedNotifications", JSON.stringify(cleaned));
      }
      return new Set(validEntries.map(([id]) => id));
    }
  } catch (e) {
    console.error("Error reading dismissed notifications:", e);
  }
  return new Set();
}

function dismissNotification(id: string) {
  try {
    const stored = localStorage.getItem("dismissedNotifications");
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[id] = Date.now();
    localStorage.setItem("dismissedNotifications", JSON.stringify(parsed));
  } catch (e) {
    console.error("Error dismissing notification:", e);
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "expired":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "expiring":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "low_stock":
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
  }
}

export function Notifications({ items, onNavigateToItem }: NotificationsProps) {
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => getDismissedNotifications());

  useEffect(() => {
    setDismissedIds(getDismissedNotifications());
  }, [items]);

  const notifications = useMemo(() => {
    const result: Notification[] = [];

    items.forEach((item) => {
      if (item.expirationDate && isValid(parseISO(item.expirationDate))) {
        const date = parseISO(item.expirationDate);
        const daysUntil = differenceInDays(date, new Date());

        if (isPast(date) && !isToday(date)) {
          result.push({
            id: `expired-${item.id}`,
            type: "expired",
            item,
            message: `${item.name} has expired`,
            priority: 1,
          });
        } else if (isToday(date)) {
          result.push({
            id: `expiring-${item.id}`,
            type: "expiring",
            item,
            message: `${item.name} expires today`,
            priority: 2,
          });
        } else if (daysUntil <= 3) {
          result.push({
            id: `expiring-${item.id}`,
            type: "expiring",
            item,
            message: `${item.name} expires in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
            priority: 3,
          });
        } else if (daysUntil <= 7) {
          result.push({
            id: `expiring-${item.id}`,
            type: "expiring",
            item,
            message: `${item.name} expires in ${daysUntil} days`,
            priority: 4,
          });
        }
      }

      if ((item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0)) {
        result.push({
          id: `lowstock-${item.id}`,
          type: "low_stock",
          item,
          message: `${item.name} is running low (${item.quantity} left)`,
          priority: 5,
        });
      }
    });

    return result
      .filter((n) => !dismissedIds.has(n.id))
      .sort((a, b) => a.priority - b.priority);
  }, [items, dismissedIds]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissNotification(id);
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleDismissAll = () => {
    notifications.forEach((n) => dismissNotification(n.id));
    setDismissedIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNavigateToItem) {
      onNavigateToItem(notification.item);
      setOpen(false);
    }
  };

  const count = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" data-testid="notifications-panel">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              className="text-xs h-7"
              data-testid="button-dismiss-all"
            >
              <Check className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[300px]">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 hover-elevate cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CategoryIcon category={notification.item.category} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="text-sm font-medium truncate">
                        {notification.item.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => handleDismiss(notification.id, e)}
                    data-testid={`button-dismiss-${notification.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function getNotificationCount(items: FreezerItem[]): number {
  const dismissed = getDismissedNotifications();
  let count = 0;

  items.forEach((item) => {
    if (item.expirationDate && isValid(parseISO(item.expirationDate))) {
      const date = parseISO(item.expirationDate);
      const daysUntil = differenceInDays(date, new Date());
      const id = isPast(date) && !isToday(date) 
        ? `expired-${item.id}` 
        : `expiring-${item.id}`;

      if ((isPast(date) && !isToday(date)) || daysUntil <= 7) {
        if (!dismissed.has(id)) count++;
      }
    }

    if ((item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0)) {
      if (!dismissed.has(`lowstock-${item.id}`)) count++;
    }
  });

  return count;
}
