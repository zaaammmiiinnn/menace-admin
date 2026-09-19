'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Plus,
  Camera,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images = [], onChange, maxImages = 8 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading and processing images...');

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        if (images.length + newUrls.length >= maxImages) {
          toast.warning(`Reached maximum limit of ${maxImages} images.`);
          break;
        }

        const file = fileList[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`"${file.name}" is not a valid image file.`);
          continue;
        }

        // Read directly as Base64 Data URL for instant resilient preview and persistence
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newUrls.push(dataUrl);
      }

      if (newUrls.length > 0) {
        const updated = [...images, ...newUrls].slice(0, maxImages);
        onChange(updated);
        toast.success(`Successfully added ${newUrls.length} image(s).`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('[Image Upload Error]:', err);
      toast.error('Failed to process image files.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput('');
    toast.success('Image URL added.');
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    toast.info('Image removed.');
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
    toast.success('Main cover image updated.');
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const result = [...images];
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    onChange(result);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#C6FF00] bg-[#C6FF00]/10 scale-[1.01]'
            : 'border-[#262626] hover:border-[#383838] bg-[#141414] hover:bg-[#181818]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#1F1F1F] border border-[#2E2E2E] flex items-center justify-center text-[#C6FF00]">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#C6FF00]" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-[#F5F1E8] font-mono">
              {isUploading ? 'PROCESSING IMAGES...' : 'CLICK TO BROWSE OR DRAG & DROP'}
            </p>
            <p className="text-[10px] text-[#8A8A8A] font-mono mt-0.5">
              Supports PNG, JPG, WebP up to 10MB (max {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar: Direct Camera Shoot & Add via URL */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cameraInputRef.current?.click();
          }}
          disabled={isUploading}
          className="h-9 px-3 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-[#F5F1E8] hover:text-[#C6FF00] rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Camera className="w-3.5 h-3.5 text-[#C6FF00]" />
          <span>Shoot Sample (Camera)</span>
        </button>

        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or paste external image URL (https://...)"
            className="flex-1 h-9 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg px-3 text-xs text-[#F5F1E8] placeholder-[#555] font-mono outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="h-9 px-3 bg-[#202020] hover:bg-[#C6FF00] text-[#F5F1E8] hover:text-[#0A0A0A] disabled:opacity-40 disabled:hover:bg-[#202020] disabled:hover:text-[#F5F1E8] border border-[#2E2E2E] rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Gallery Preview */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A] px-1">
            <span>
              UPLOADED ASSETS ({images.length}/{maxImages})
            </span>
            <span className="text-[#C6FF00]">★ First image is Main Cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-lg border border-[#262626] bg-[#0E0E0E] overflow-hidden flex flex-col justify-between p-1.5 transition-all hover:border-[#444]"
              >
                {/* Image display */}
                <img
                  src={url}
                  alt={`Product asset ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  {idx === 0 ? (
                    <span className="bg-[#C6FF00] text-[#0A0A0A] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-[#0A0A0A]" /> COVER
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="bg-black/70 hover:bg-[#C6FF00] text-[#8A8A8A] hover:text-[#0A0A0A] text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#333] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Set Cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="w-6 h-6 rounded-full bg-red-950/80 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                    title="Delete Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Order Controls */}
                <div className="relative z-10 flex items-center justify-between w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, idx - 1)}
                        className="w-5 h-5 bg-black/80 hover:bg-[#C6FF00] text-white hover:text-black rounded flex items-center justify-center transition-colors"
                        title="Move left"
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, idx + 1)}
                        className="w-5 h-5 bg-black/80 hover:bg-[#C6FF00] text-white hover:text-black rounded flex items-center justify-center transition-colors"
                        title="Move right"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[9px] font-mono bg-black/80 text-[#8A8A8A] px-1 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#181818] rounded-lg border border-dashed border-[#282828] text-center space-y-1">
          <ImageIcon className="w-5 h-5 text-[#555] mx-auto" />
          <p className="text-xs text-[#8A8A8A] font-mono">No imagery assets configured yet</p>
          <p className="text-[10px] text-[#555] font-mono">
            Upload images from your device or paste URLs above
          </p>
        </div>
      )}
    </div>
  );
}
