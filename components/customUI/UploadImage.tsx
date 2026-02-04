"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UploadImageProps {
  value: string[]; // current image URLs
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function UploadImage({ value, onChange, onRemove }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const url = URL.createObjectURL(file);
    onChange(url);

    // 👉 if you upload to backend/cloudinary, do it here
    // const formData = new FormData();
    // formData.append("file", file);
    // const res = await fetch("/api/upload", { method: "POST", body: formData });
    // const data = await res.json();
    // onChange(data.url);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {value && value.length > 0 ? (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-blue-200 shadow-sm group">
          <Image
            src={value[0]}
            alt="uploaded"
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 rounded-full bg-white/70 p-1 shadow hover:bg-white"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full border border-dashed border-blue-300 rounded-xl py-10 cursor-pointer transition hover:bg-blue-50/50"
          )}
        >
          <ImagePlus className="h-8 w-8 text-blue-600 mb-2" />
          <p className="text-sm text-blue-700 font-medium">Click or drag to upload</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value && value.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mt-1"
        >
          Change Image
        </Button>
      )}
    </div>
  );
}
