import { Snowflake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddItem: () => void;
  hasFilters?: boolean;
}

export function EmptyState({ onAddItem, hasFilters = false }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state-filtered">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Snowflake className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Snowflake className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Your freezer is empty</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Start tracking your frozen goods by adding your first item. Keep track of what's stored and when it expires.
      </p>
      <Button onClick={onAddItem} data-testid="button-add-first-item">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Item
      </Button>
    </div>
  );
}
