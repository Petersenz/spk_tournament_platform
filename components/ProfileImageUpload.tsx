"use client";

import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import Image from "next/image";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  name?: string;
  label?: string;
}

export function ProfileImageUpload({
  currentImageUrl,
  name = "avatar",
  label,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative h-32 w-32 rounded-full bg-bg-tertiary border-2 border-dashed border-white/10 hover:border-brand-primary/50 cursor-pointer overflow-hidden group transition-all"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile Preview"
            fill
            className="object-cover group-hover:opacity-50 transition-opacity"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-tertiary">
            <User className="h-12 w-12" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      <input
        type="file"
        name={name}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
        {label || "Click to change avatar"}
      </p>
    </div>
  );
}
