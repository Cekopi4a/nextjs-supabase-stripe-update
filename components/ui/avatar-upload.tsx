"use client";

import { useState, useRef } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { User, Upload, X, Camera } from "lucide-react";
import { cn } from "@/utils/styles";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  size = "md",
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseClient();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Моля, изберете валиден файл със снимка");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Файлът трябва да бъде по-малък от 5MB");
      return;
    }

    setIsUploading(true);

    try {
      console.log("Starting avatar upload...");

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("User data:", { user: !!user, error: userError });

      if (userError) {
        throw new Error("Грешка при получаване на потребителски данни: " + userError.message);
      }

      if (!user) {
        throw new Error("Потребителят не е автентикиран");
      }

      // Create file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      console.log("Upload filename:", fileName);

      // Delete existing avatar if it exists
      if (currentAvatarUrl) {
        console.log("Deleting old avatar:", currentAvatarUrl);
        const oldFileName = currentAvatarUrl.split("/").pop();
        if (oldFileName) {
          const { error: deleteError } = await supabase.storage.from("avatars").remove([oldFileName]);
          if (deleteError) {
            console.warn("Could not delete old avatar:", deleteError);
          }
        }
      }

      // Upload new file
      console.log("Uploading file to storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      console.log("Upload result:", { data: uploadData, error: uploadError });

      if (uploadError) {
        throw new Error("Грешка при качване: " + uploadError.message);
      }

      if (!uploadData) {
        throw new Error("Няма данни от качването");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);

      console.log("Public URL:", publicUrl);

      // Update profile in database
      console.log("Updating profile in database...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      console.log("Database update result:", { error: updateError });

      if (updateError) {
        throw new Error("Грешка при обновяване на профила: " + updateError.message);
      }

      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);
      console.log("Avatar upload completed successfully!");
    } catch (error: any) {
      console.error("Грешка при качване на снимката:", error);
      alert("Възникна грешка при качване на снимката: " + (error.message || error));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Потребителят не е автентикиран");
      }

      // Delete file from storage
      const fileName = currentAvatarUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("avatars").remove([fileName]);
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setPreviewUrl(null);
      onAvatarChange(null);
    } catch (error) {
      console.error("Грешка при премахване на снимката:", error);
      alert("Възникна грешка при премахване на снимката");
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Avatar Display */}
      <div className={cn(
        "relative rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50",
        sizeClasses[size]
      )}>
        {avatarUrl ? (
          <>
            <img
              src={avatarUrl}
              alt="Профилна снимка"
              className="w-full h-full object-cover"
            />
            {!isUploading && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <Spinner className="text-gray-400" />
            ) : (
              <User size={iconSizes[size]} className="text-gray-400" />
            )}
          </div>
        )}

        {/* Upload Overlay */}
        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
            disabled={isUploading}
          >
            <Camera size={iconSizes[size]} className="text-white" />
          </button>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload size={16} className="mr-2" />
          {avatarUrl ? "Промени" : "Качи снимка"}
        </Button>

        {avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X size={16} className="mr-2" />
            Премахни
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        JPG, PNG или GIF до 5MB
      </p>
    </div>
  );
}