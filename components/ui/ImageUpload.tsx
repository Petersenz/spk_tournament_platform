"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  className?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  className,
  label = "Upload Image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      const err = error as Error;
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        ref={fileInputRef}
        className="hidden"
      />

      <div
        className={cn(
          "relative h-48 w-full rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-brand-primary/30 hover:bg-white/[0.04] cursor-pointer",
          value && "border-solid border-white/10",
        )}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
              Uploading...
            </span>
          </div>
        ) : value ? (
          <>
            <Image
              src={value}
              alt="Uploaded logo"
              fill
              className="object-contain p-4"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-error/10 hover:bg-error/20 text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-tertiary group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="text-center">
              <span className="text-sm font-black uppercase tracking-widest text-white block mb-1">
                {label}
              </span>
              <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                PNG, JPG or SVG (Max 2MB)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
