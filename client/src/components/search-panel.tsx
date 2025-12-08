import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FreezerItemCard } from "@/components/freezer-item-card";
import type { FreezerItem } from "@shared/schema";

interface SearchPanelProps {
  items: FreezerItem[];
  onEdit: (item: FreezerItem) => void;
  onDelete: (item: FreezerItem) => void;
}

export function SearchPanel({ items, onEdit, onDelete }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const filteredItems = query.trim()
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.notes?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items by name or notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-panel"
          autoFocus
        />
      </div>

      {query.trim() === "" ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search your freezer inventory</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No items found matching "{query}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "result" : "results"}
          </p>
          {filteredItems.map((item) => (
            <FreezerItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
