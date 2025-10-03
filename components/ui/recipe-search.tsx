"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChefHat, Clock, Users } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  category: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
}

interface RecipeSearchProps {
  onRecipeSelect: (recipe: Recipe) => void;
  placeholder?: string;
}

const CATEGORY_LABELS: { [key: string]: string } = {
  'appetizer': 'Предястия',
  'main_course': 'Основни',
  'dessert': 'Десерти',
  'snack': 'Закуски',
  'drink': 'Напитки',
  'sauce': 'Сосове',
  'salad': 'Салати',
  'soup': 'Супи',
  'other': 'Други'
};

const CATEGORY_COLORS: { [key: string]: string } = {
  'appetizer': 'bg-green-100 text-green-800',
  'main_course': 'bg-red-100 text-red-800',
  'dessert': 'bg-pink-100 text-pink-800',
  'snack': 'bg-yellow-100 text-yellow-800',
  'drink': 'bg-blue-100 text-blue-800',
  'sauce': 'bg-orange-100 text-orange-800',
  'salad': 'bg-emerald-100 text-emerald-800',
  'soup': 'bg-amber-100 text-amber-800',
  'other': 'bg-slate-100 text-slate-800'
};

export default function RecipeSearch({ onRecipeSelect, placeholder = "Търсете рецепта..." }: RecipeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch all recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Filter recipes based on search term
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setFilteredRecipes(filtered);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setFilteredRecipes([]);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, recipes]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not { recipes: [] }
        setRecipes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || filteredRecipes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredRecipes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredRecipes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleRecipeSelect(filteredRecipes[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    onRecipeSelect(recipe);
    setSearchTerm('');
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={resultsRef}>
      <div className="relative">
        <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredRecipes.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto shadow-lg min-w-[400px]">
          <div className="p-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                Зареждане...
              </div>
            ) : filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className={`
                    px-3 py-2 cursor-pointer rounded transition-colors
                    ${index === selectedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                  onClick={() => handleRecipeSelect(recipe)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-sm">{recipe.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[recipe.category] || CATEGORY_COLORS.other}`}
                      >
                        {CATEGORY_LABELS[recipe.category] || recipe.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground ml-2 flex-shrink-0 min-w-[60px] text-right">
                      {recipe.calories_per_serving} кал
                    </div>
                  </div>

                  {recipe.description && (
                    <div className="text-xs text-muted-foreground mb-1 truncate">
                      {recipe.description}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {recipe.servings} порции
                    </div>
                    {recipe.total_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.total_time_minutes} мин
                      </div>
                    )}
                    <div>
                      П: {recipe.protein_per_serving}г • В: {recipe.carbs_per_serving}г • М: {recipe.fat_per_serving}г
                    </div>
                  </div>
                </div>
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">Няма намерени рецепти за &quot;{searchTerm}&quot;</div>
                <div className="text-xs">
                  Можете да добавите нова рецепта в менюто Рецепти
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Въведете поне 2 символа за търсене
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
