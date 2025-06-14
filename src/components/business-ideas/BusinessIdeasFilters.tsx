
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon } from 'lucide-react';

interface BusinessIdeasFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filterScore: string;
  setFilterScore: (value: string) => void;
  filterProgress: string;
  setFilterProgress: (value: string) => void;
}

const BusinessIdeasFilters: React.FC<BusinessIdeasFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterScore,
  setFilterScore,
  filterProgress,
  setFilterProgress,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div className="relative md:col-span-2 lg:col-span-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search business ideas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="highest_score">Highest Score</SelectItem>
          <SelectItem value="lowest_score">Lowest Score</SelectItem>
          <SelectItem value="most_complete">Most Complete</SelectItem>
          <SelectItem value="a-z">A-Z</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterScore} onValueChange={setFilterScore}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by Score..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_scores">All Scores</SelectItem>
          <SelectItem value="high">High (7-10)</SelectItem>
          <SelectItem value="medium">Medium (4-7)</SelectItem>
          <SelectItem value="low">Low (0-4)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterProgress} onValueChange={setFilterProgress}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by Progress..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_progress">All Progress</SelectItem>
          <SelectItem value="high">High Progress (60%+)</SelectItem>
          <SelectItem value="medium">Medium Progress (30-60%)</SelectItem>
          <SelectItem value="low">Low Progress (&lt;30%)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BusinessIdeasFilters;
