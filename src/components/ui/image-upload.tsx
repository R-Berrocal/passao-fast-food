"use client";

import * as React from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    setError(null);
    setUploadState("uploading");

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const url = await uploadProductImage(file);
      onChange(url);
      setUploadState("success");
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
      setUploadState("error");
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    } else {
      setError("Por favor, seleccione un archivo de imagen válido");
    }
  };

  const handleRemove = async () => {
    if (disabled) return;

    // Try to delete from storage if it's a Supabase URL
    if (value?.includes("supabase.co")) {
      try {
        await deleteProductImage(value);
      } catch {
        // Ignore deletion errors, just remove from form
      }
    }

    onChange("");
    setPreviewUrl(null);
    setUploadState("idle");
    setError(null);
    onRemove?.();
  };

  const displayUrl = previewUrl || value;
  const isUploading = uploadState === "uploading";

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-lg border">
          <Image
            src={displayUrl}
            alt="Vista previa"
            className={cn(
              "h-48 w-full object-cover transition-opacity",
              isUploading && "opacity-50"
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x300?text=Imagen+no+disponible";
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {!isUploading && !disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled && !isUploading) {
                inputRef.current?.click();
              }
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50",
            isUploading && "cursor-wait"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Subiendo imagen...
              </span>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <span className="text-sm font-medium">
                  Arrastra una imagen aquí
                </span>
                <p className="text-xs text-muted-foreground">
                  o haz clic para seleccionar
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
