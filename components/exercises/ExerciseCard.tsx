'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise, ExerciseCardProps } from '@/lib/types/exercises';
import { Eye, Plus, Check } from 'lucide-react';
import Image from 'next/image';

export function ExerciseCard({
  exercise,
  onSelect,
  onDetails,
  isSelected = false,
  showDetails = true,
  compact = false
}: ExerciseCardProps & { compact?: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const firstImage = exercise.images?.[0];
  const primaryMuscles = exercise.primary_muscles?.slice(0, 2) || [];

  // Validate image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'destructive';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'default';
      case 'cardio': return 'info';
      case 'flexibility': return 'secondary';
      case 'plyometrics': return 'warning';
      default: return 'outline';
    }
  };

  const formatEquipment = (equipment: string | string[]) => {
    if (!equipment) return 'Unknown';

    // Handle array of equipment
    if (Array.isArray(equipment)) {
      return equipment.map(item =>
        String(item)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
      ).join(', ');
    }

    // Handle single equipment string
    return String(equipment)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatMuscle = (muscle: string | undefined) => {
    if (!muscle) return '';
    return String(muscle)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Compact horizontal layout for sidebar
  if (compact) {
    return (
      <Card className={`
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
      `}>
        <div className="flex gap-3 p-3">
          {/* Exercise Image */}
          <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {firstImage && isValidImageUrl(firstImage) && !imageError ? (
              <Image
                src={firstImage}
                alt={exercise.name}
                fill
                className={`object-cover transition-opacity duration-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-2xl">💪</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                {exercise.name}
              </h3>
              <Badge variant={getLevelColor(exercise.level)} className="text-xs flex-shrink-0">
                {exercise.level}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant={getCategoryColor(exercise.category)} className="text-xs">
                {exercise.category}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {formatEquipment(exercise.equipment)}
            </div>

            {/* Actions */}
            <div className="flex gap-1 mt-auto">
              {onSelect && (
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(exercise);
                  }}
                  className="flex-1 h-7 text-xs"
                >
                  {isSelected ? <Check className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                  {isSelected ? 'Added' : 'Add'}
                </Button>
              )}

              {showDetails && onDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetails(exercise);
                  }}
                  className="h-7 px-2"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default vertical layout
  return (
    <Card className={`
      h-full transition-all duration-200 hover:shadow-md cursor-pointer
      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 leading-tight">
            {exercise.name}
          </CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            <Badge variant={getLevelColor(exercise.level)}>
              {exercise.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Exercise Image */}
        <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden">
          {firstImage && isValidImageUrl(firstImage) && !imageError ? (
            <Image
              src={firstImage}
              alt={exercise.name}
              fill
              className={`object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-1">💪</div>
                <div className="text-xs">No Image</div>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant={getCategoryColor(exercise.category)}>
              {exercise.category}
            </Badge>
            {exercise.force && (
              <Badge variant="outline">
                {exercise.force}
              </Badge>
            )}
            {exercise.mechanic && (
              <Badge variant="outline">
                {exercise.mechanic}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium">Equipment:</span>
              <span>{formatEquipment(exercise.equipment)}</span>
            </div>

            {primaryMuscles.length > 0 && (
              <div className="flex items-start gap-1">
                <span className="font-medium">Muscles:</span>
                <span className="line-clamp-1">
                  {primaryMuscles.map(formatMuscle).join(', ')}
                  {exercise.primary_muscles.length > 2 && ' +more'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {onSelect && (
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(exercise);
            }}
            className="flex-1"
          >
            {isSelected ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {isSelected ? 'Selected' : 'Add'}
          </Button>
        )}

        {showDetails && onDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDetails(exercise);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ExerciseCard;