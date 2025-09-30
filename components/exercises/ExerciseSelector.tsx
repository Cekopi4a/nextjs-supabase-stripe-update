'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';
import { 
  Exercise, 
  ExerciseSearchFilters, 
  ExerciseSelectionProps,
  MUSCLE_GROUPS 
} from '@/lib/types/exercises';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { debounce } from 'lodash';

export function ExerciseSelector({ 
  onExerciseSelect, 
  selectedExercises = [],
  filters: initialFilters = {}
}: ExerciseSelectionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<Exercise | null>(null);
  
  // Search and filter state
  const [filters, setFilters] = useState<ExerciseSearchFilters>({
    searchTerm: '',
    limit: 24,
    ...initialFilters
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: ExerciseSearchFilters) => {
      await searchExercises(searchFilters);
    }, 300),
    []
  );

  const searchExercises = async (searchFilters: ExerciseSearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (searchFilters.searchTerm) queryParams.append('search', searchFilters.searchTerm);
      if (searchFilters.level) queryParams.append('level', searchFilters.level);
      if (searchFilters.category) queryParams.append('category', searchFilters.category);
      if (searchFilters.equipment) queryParams.append('equipment', searchFilters.equipment);
      if (searchFilters.primaryMuscle) queryParams.append('muscle', searchFilters.primaryMuscle);
      if (searchFilters.limit) queryParams.append('limit', searchFilters.limit.toString());
      
      const response = await fetch(`/api/exercises/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Search failed');
      }
      
      setExercises(result.data || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search exercises';
      setError(errorMessage);
      console.error('Exercise search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    searchExercises(filters);
  }, []);

  // Handle search input changes
  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const handleFilterChange = (key: keyof ExerciseSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      limit: 24
    });
  };

  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.level) count++;
    if (filters.category) count++;
    if (filters.equipment) count++;
    if (filters.primaryMuscle) count++;
    return count;
  }, [filters]);

  const categories = [
    'strength',
    'cardio', 
    'flexibility',
    'plyometrics',
    'strongman',
    'powerlifting',
    'olympic_weightlifting'
  ];

  const equipmentTypes = [
    'body_only',
    'barbell',
    'dumbbell', 
    'machine',
    'cable',
    'kettlebell',
    'bands',
    'medicine_ball',
    'exercise_ball',
    'other'
  ];

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Exercise Library</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => searchExercises(filters)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search exercises..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              {/* Level Filter */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={filters.level || ''}
                  onValueChange={(value) => handleFilterChange('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Muscle Filter */}
              <div className="space-y-2">
                <Label>Primary Muscle</Label>
                <Select
                  value={filters.primaryMuscle || ''}
                  onValueChange={(value) => handleFilterChange('primaryMuscle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All muscles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All muscles</SelectItem>
                    {MUSCLE_GROUPS.map(muscle => (
                      <SelectItem key={muscle} value={muscle}>
                        {muscle.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment Filter */}
              <div className="space-y-2">
                <Label>Equipment</Label>
                <Select
                  value={filters.equipment || ''}
                  onValueChange={(value) => handleFilterChange('equipment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All equipment</SelectItem>
                    {equipmentTypes.map(equipment => (
                      <SelectItem key={equipment} value={equipment}>
                        {equipment.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Results Count and Status */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {loading ? (
                'Searching...'
              ) : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                `${exercises.length} exercises found`
              )}
            </span>
            
            {selectedExercises.length > 0 && (
              <span className="text-blue-600 font-medium">
                {selectedExercises.length} selected
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {loading && exercises.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No exercises found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={onExerciseSelect}
              onDetails={setSelectedExerciseForDetails}
              isSelected={isExerciseSelected(exercise)}
              showDetails={true}
              compact={true}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {exercises.length >= (filters.limit || 24) && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('limit', (filters.limit || 24) + 24)}
            disabled={loading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={selectedExerciseForDetails}
        isOpen={!!selectedExerciseForDetails}
        onClose={() => setSelectedExerciseForDetails(null)}
      />
    </div>
  );
}

export default ExerciseSelector;