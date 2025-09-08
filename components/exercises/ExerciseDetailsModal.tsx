'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise, ExerciseDetailsModalProps } from '@/lib/types/exercises';
import { 
  Target, 
  Dumbbell, 
  Users, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from 'lucide-react';
import Image from 'next/image';

export function ExerciseDetailsModal({ 
  exercise, 
  isOpen, 
  onClose 
}: ExerciseDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!exercise) return null;

  const images = exercise.images || [];
  const currentImage = images[currentImageIndex];
  
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

  const formatText = (text: string | undefined) => {
    if (!text) return '';
    return String(text)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setImageLoaded(false);
      setImageError(false);
    }
  };

  const previousImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setImageLoaded(false);
      setImageError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            {exercise.name}
          </DialogTitle>
          
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getLevelColor(exercise.level)}>
                {formatText(exercise.level)}
              </Badge>
              <Badge variant={getCategoryColor(exercise.category)}>
                {formatText(exercise.category)}
              </Badge>
              {exercise.force && (
                <Badge variant="outline">
                  {formatText(exercise.force)}
                </Badge>
              )}
              {exercise.mechanic && (
                <Badge variant="outline">
                  {formatText(exercise.mechanic)}
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Exercise Images */}
          <div className="space-y-4">
            <div className="relative w-full h-64 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
              {currentImage && !imageError ? (
                <>
                  <Image
                    src={currentImage}
                    alt={`${exercise.name} - Image ${currentImageIndex + 1}`}
                    fill
                    className={`object-contain transition-opacity duration-200 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💪</div>
                    <div className="text-sm">No Image Available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setImageLoaded(false);
                      setImageError(false);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${exercise.name} thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exercise Information */}
          <div className="space-y-4">
            {/* Equipment */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Equipment Needed</h3>
                </div>
                <p className="text-sm">{formatText(exercise.equipment)}</p>
              </CardContent>
            </Card>

            {/* Muscles */}
            {exercise.primary_muscles.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Target Muscles</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Primary</h4>
                      <div className="flex flex-wrap gap-1">
                        {exercise.primary_muscles.map((muscle, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {formatText(muscle)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {exercise.secondary_muscles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Secondary</h4>
                        <div className="flex flex-wrap gap-1">
                          {exercise.secondary_muscles.map((muscle, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {formatText(muscle)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Exercise Info</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span>
                    <p className="font-medium">{formatText(exercise.level)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{formatText(exercise.category)}</p>
                  </div>
                  {exercise.force && (
                    <div>
                      <span className="text-muted-foreground">Force:</span>
                      <p className="font-medium">{formatText(exercise.force)}</p>
                    </div>
                  )}
                  {exercise.mechanic && (
                    <div>
                      <span className="text-muted-foreground">Mechanic:</span>
                      <p className="font-medium">{formatText(exercise.mechanic)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercise Instructions */}
        {exercise.instructions.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">How to Perform</h3>
              </div>
              
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add to Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExerciseDetailsModal;