
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, FilterIcon } from "@/utils/iconMapping";
import { cities, sports, centers, Sport, Center } from "@/data/mockData";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  showSportFilter?: boolean;
  showCityFilter?: boolean;
  showLocationFilter?: boolean;
  showSearchFilter?: boolean;
  className?: string;
}

export interface FilterState {
  sportId?: string;
  city?: string;
  location?: string;
  searchTerm?: string;
}

export function FilterBar({
  onFilterChange,
  showSportFilter = true,
  showCityFilter = true,
  showLocationFilter = true,
  showSearchFilter = true,
  className,
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        {showSearchFilter && (
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search venues or sports..."
                className="pl-9"
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="shrink-0"
        >
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 pb-4">
          {showSportFilter && (
            <Select
              value={filters.sportId}
              onValueChange={(value) => handleFilterChange('sportId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sports</SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {showCityFilter && (
            <Select
              value={filters.city}
              onValueChange={(value) => handleFilterChange('city', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((city, index) => (
                  <SelectItem key={index} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {showLocationFilter && (
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange('location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {/* Get unique locations */}
                {Array.from(new Set(filters.city 
                  ? centers.filter(c => c.city === filters.city).map(c => c.location) 
                  : centers.map(c => c.location)
                )).map((location, index) => (
                  <SelectItem key={index} value={location as string}>
                    {location as React.ReactNode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
