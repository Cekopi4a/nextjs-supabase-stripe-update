"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { X, Upload, Image, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onFileChange: (files: string[]) => void;
  currentFiles?: string[];
  label: string;
  description?: string;
  className?: string;
}

export function FileUpload({
  accept,
  multiple = false,
  onFileChange,
  currentFiles = [],
  label,
  description,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Грешка при качване на файла ${file.name}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUploads = uploadedUrls.filter(url => url !== null);

    if (multiple) {
      onFileChange([...currentFiles, ...successfulUploads]);
    } else {
      onFileChange(successfulUploads);
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    onFileChange(newFiles);
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|png|webp)$/i);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)$/i);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor="file-upload">{label}</Label>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          uploading && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Качване..." : "Избери файлове"}
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            или пуснете файловете тук
          </p>
        </div>
      </div>

      {/* Preview uploaded files */}
      {currentFiles.length > 0 && (
        <div className="space-y-3">
          <Label>Качени файлове:</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentFiles.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {isImage(url) ? (
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo(url) ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                      aria-label={`Video ${index + 1}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  {isImage(url) && <Image className="h-3 w-3 inline mr-1" />}
                  {isVideo(url) && <Video className="h-3 w-3 inline mr-1" />}
                  {isImage(url) ? "Снимка" : "Видео"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}