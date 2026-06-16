"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";

interface UploadFormData {
  name: string;
  brandId: string;
  categoryId: string;
  basePriceCents: string;
  variants: Array<{ size: string; stockCount: string }>;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductUploadFormProps {
  brands: Brand[];
  categories: Category[];
  onProductCreated: (product: unknown) => void;
}

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];

export function ProductUploadForm({
  brands,
  categories,
  onProductCreated,
}: ProductUploadFormProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    name: "",
    brandId: "",
    categoryId: "",
    basePriceCents: "",
    variants: SIZES.map((s) => ({ size: s, stockCount: "0" })),
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 8);
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 8));
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string].slice(0, 8));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 8,
  });

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const activeVariants = formData.variants.filter(
        (v) => parseInt(v.stockCount) > 0,
      );

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brandId: formData.brandId,
          categoryId: formData.categoryId,
          basePriceCents: Math.round(parseFloat(formData.basePriceCents) * 100),
          variants: activeVariants.map((v) => ({
            size: v.size,
            stockCount: parseInt(v.stockCount),
          })),
          imageUrls: imagePreviews,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create product");
      }

      const product = await res.json();
      onProductCreated(product);

      setFormData({
        name: "",
        brandId: "",
        categoryId: "",
        basePriceCents: "",
        variants: SIZES.map((s) => ({ size: s, stockCount: "0" })),
      });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-sm font-sans text-red-700">
          {error}
        </div>
      )}

      {/* Image upload zone */}
      <div>
        <label className="luxury-label mb-3">Product Images</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? "border-heritage-green bg-heritage-green/[0.02]"
              : "border-slate-border hover:border-neutral-300"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            className="mx-auto mb-3 text-neutral-300"
            size={32}
            strokeWidth={1}
          />
          <p className="text-sm font-sans text-neutral-500 mb-1">
            Drag & drop product images here
          </p>
          <p className="text-xs font-sans text-neutral-400">
            JPEG, PNG, WebP — up to 10MB each — max 8 images
          </p>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-square bg-ivory">
                <img
                  src={src}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-white/90 text-obsidian/60 hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-heritage-green text-white text-[8px] font-sans font-bold tracking-wider uppercase">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="luxury-label">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="luxury-input"
            placeholder="e.g., Silk Twill Blazer"
            required
          />
        </div>

        <div>
          <label className="luxury-label">Base Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.basePriceCents}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, basePriceCents: e.target.value }))
            }
            className="luxury-input"
            placeholder="1250.00"
            required
          />
        </div>

        <div>
          <label className="luxury-label">Brand</label>
          <select
            value={formData.brandId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, brandId: e.target.value }))
            }
            className="luxury-input"
            required
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="luxury-label">Category</label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="luxury-input"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Size & Stock grid */}
      <div>
        <label className="luxury-label mb-3">Size & Stock</label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {formData.variants.map((variant, idx) => (
            <div key={variant.size} className="space-y-1">
              <span className="text-[10px] font-sans font-medium text-neutral-400 text-center block">
                {variant.size}
              </span>
              <input
                type="number"
                min="0"
                value={variant.stockCount}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[idx].stockCount = e.target.value;
                  setFormData((prev) => ({ ...prev, variants: newVariants }));
                }}
                className="luxury-input text-center text-xs h-10 px-2"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="luxury-button-primary w-full md:w-auto gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating & Generating Heritage...
          </>
        ) : (
          <>
            <Upload size={16} />
            Create Product & Generate Heritage
          </>
        )}
      </button>
    </form>
  );
}
