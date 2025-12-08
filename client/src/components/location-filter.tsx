import { Button } from "@/components/ui/button";
import { locations, locationLabels, type Location } from "@shared/schema";
import { MapPin, X } from "lucide-react";

interface LocationFilterProps {
  selectedLocation: Location | null;
  onLocationChange: (location: Location | null) => void;
}

export function LocationFilter({ selectedLocation, onLocationChange }: LocationFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="location-filter-container">
      <Button
        variant={selectedLocation === null ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onLocationChange(null)}
        data-testid="button-location-all"
      >
        <MapPin className="h-4 w-4 mr-1.5" />
        All Zones
      </Button>
      {locations.filter(l => l !== "unassigned").map((location) => {
        const isActive = selectedLocation === location;

        return (
          <Button
            key={location}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onLocationChange(isActive ? null : location)}
            data-testid={`button-location-${location}`}
          >
            {locationLabels[location]}
          </Button>
        );
      })}
      {selectedLocation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLocationChange(null)}
          className="text-muted-foreground"
          data-testid="button-clear-location"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
