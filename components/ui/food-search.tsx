"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown } from 'lucide-react';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
}

interface FoodSearchProps {
  onFoodSelect: (food: Food) => void;
  placeholder?: string;
}

const CATEGORY_LABELS: { [key: string]: string } = {
  'protein': 'Протеин',
  'dairy': 'Млечни продукти',
  'vegetables': 'Зеленчуци',
  'fruits': 'Плодове',
  'grains': 'Житни храни',
  'legumes': 'Бобови култури',
  'fats': 'Мазнини',
  'beverages': 'Напитки',
  'other': 'Други'
};

const CATEGORY_COLORS: { [key: string]: string } = {
  'protein': 'bg-red-100 text-red-800',
  'dairy': 'bg-blue-100 text-blue-800',
  'vegetables': 'bg-green-100 text-green-800',
  'fruits': 'bg-orange-100 text-orange-800',
  'grains': 'bg-yellow-100 text-yellow-800',
  'legumes': 'bg-purple-100 text-purple-800',
  'fats': 'bg-pink-100 text-pink-800',
  'beverages': 'bg-gray-100 text-gray-800',
  'other': 'bg-slate-100 text-slate-800'
};

export default function FoodSearch({ onFoodSelect, placeholder = "Търсете храна..." }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch all foods on component mount
  useEffect(() => {
    fetchFoods();
  }, []);

  // Filter foods based on search term
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setFilteredFoods(filtered);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setFilteredFoods([]);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, foods]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/food-items');
      if (response.ok) {
        const data = await response.json();
        setFoods(data.foods || []);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || filteredFoods.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredFoods.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredFoods.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleFoodSelect(filteredFoods[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredFoods.length > 0) {
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
            ) : filteredFoods.length > 0 ? (
              filteredFoods.map((food, index) => (
                <div
                  key={food.id}
                  className={`
                    px-3 py-2 cursor-pointer rounded transition-colors
                    ${index === selectedIndex 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                  onClick={() => handleFoodSelect(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-sm">{food.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[food.category] || CATEGORY_COLORS.other}`}
                      >
                        {CATEGORY_LABELS[food.category] || food.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground ml-2 flex-shrink-0 min-w-[60px] text-right">
                      {food.calories_per_100g} кал
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    П: {food.protein_per_100g}г • В: {food.carbs_per_100g}г • М: {food.fat_per_100g}г
                  </div>
                </div>
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">Няма намерени храни за &quot;{searchTerm}&quot;</div>
                <div className="text-xs">
                  Можете да добавите нова храна в настройките
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