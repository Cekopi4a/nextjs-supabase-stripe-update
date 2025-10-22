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
import { Search, Filter, X, RefreshCw, Plus } from 'lucide-react';
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
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">💪</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Exercise Library
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Избери упражнение за добавяне
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative border-2 hover:border-blue-400 transition-colors"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => searchExercises(filters)}
                disabled={loading}
                className="hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
            <Input
              placeholder="🔍 Търси упражнения по име..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              {/* Level Filter */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={filters.level || 'all'}
                  onValueChange={(value) => handleFilterChange('level', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
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
                  value={filters.category || 'all'}
                  onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
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
                  value={filters.primaryMuscle || 'all'}
                  onValueChange={(value) => handleFilterChange('primaryMuscle', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All muscles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All muscles</SelectItem>
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
                  value={filters.equipment || 'all'}
                  onValueChange={(value) => handleFilterChange('equipment', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All equipment</SelectItem>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Searching...</span>
                </div>
              ) : error ? (
                <span className="text-sm font-medium text-destructive">⚠️ {error}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{exercises.length}</span>
                  <span className="text-sm text-muted-foreground">упражнения намерени</span>
                </div>
              )}
            </div>

            {selectedExercises.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 px-3 py-1.5 rounded-full">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedExercises.length}
                </span>
                <span className="text-xs text-muted-foreground">избрани</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {loading && exercises.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <RefreshCw className="h-8 w-8 animate-spin text-white" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Зареждане на упражнения...</p>
        </div>
      ) : exercises.length === 0 ? (
        <Card className="border-2 border-dashed">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Няма намерени упражнения</h3>
            <p className="text-muted-foreground mb-4">Опитайте да промените търсенето или филтрите</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                <X className="h-4 w-4 mr-2" />
                Изчисти филтрите
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
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
            size="lg"
            onClick={() => handleFilterChange('limit', (filters.limit || 24) + 24)}
            disabled={loading}
            className="border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all min-w-[200px]"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Зареждане...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Зареди още упражнения
              </>
            )}
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