"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  basePriceCents: number;
  salePriceCents: number | null;
  status: "DRAFT" | "AI_PENDING" | "AI_REVIEW" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  images: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
};

const MAX_IMAGES = 8;

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [status, setStatus] = useState<Product["status"]>("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    fetch(`/api/products/${productId}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load this product");
        return (await response.json()) as Product;
      })
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setName(data.name);
        setDescription(data.description ?? "");
        setBasePrice((data.basePriceCents / 100).toFixed(2));
        setSalePrice(data.salePriceCents == null ? "" : (data.salePriceCents / 100).toFixed(2));
        setStatus(data.status);
        setIsFeatured(data.isFeatured);
        setImageUrls(data.images.map((image) => image.url));
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const canSave = useMemo(() => name.trim().length > 0 && Number(basePrice) >= 0, [name, basePrice]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - imageUrls.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setImageUrls((current) => [...current, reader.result as string].slice(0, MAX_IMAGES));
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!canSave) {
      setError("Enter a product name and a valid base price.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          basePriceCents: Math.round(Number(basePrice) * 100),
          salePriceCents: salePrice.trim() ? Math.round(Number(salePrice) * 100) : null,
          status,
          isFeatured,
          imageUrls,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save product");
      setProduct(data);
      setImageUrls(data.images.map((image: Product["images"][number]) => image.url));
      setNotice("Product saved successfully. Returning to products…");
      window.setTimeout(() => router.replace("/admin/products"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-neutral-500">Loading product…</div>;
  if (!product) return <div className="p-8 text-sm text-red-600">{error ?? "Product not found"}</div>;

  return (
    <div className="max-w-4xl">
      <button type="button" onClick={() => router.push("/admin/products")} className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 hover:text-obsidian">
        <ArrowLeft size={14} /> Back to products
      </button>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-obsidian">Edit Product</h1>
        <p className="mt-1 text-sm text-neutral-400">Update product details, availability, and images.</p>
      </div>
      {error && <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="border border-slate-border bg-white p-6">
          <label className="luxury-label">Product images</label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imageUrls.map((url, index) => (
              <div key={`${url.slice(0, 30)}-${index}`} className="relative aspect-square bg-ivory">
                <img src={url} alt={`${name} ${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-white/90 text-neutral-600 hover:text-red-600" aria-label={`Remove image ${index + 1}`}>
                  <X size={13} />
                </button>
              </div>
            ))}
            {imageUrls.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed border-slate-border text-neutral-400 hover:border-heritage-green hover:text-heritage-green">
                <ImagePlus size={22} />
                <span className="mt-2 text-center text-[10px] uppercase tracking-wider">Add image</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} />
              </label>
            )}
          </div>
          <p className="mt-3 text-xs text-neutral-400">JPEG, PNG, or WebP. Up to {MAX_IMAGES} images.</p>
        </section>

        <section className="grid gap-6 border border-slate-border bg-white p-6 md:grid-cols-2">
          <div><label className="luxury-label">Product name</label><input className="luxury-input" value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div><label className="luxury-label">Base price (USD)</label><input className="luxury-input" type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} required /></div>
          <div><label className="luxury-label">Sale price (USD)</label><input className="luxury-input" type="number" min="0" step="0.01" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} /></div>
          <div><label className="luxury-label">Status</label><select className="luxury-input" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])}>{["DRAFT", "AI_REVIEW", "PUBLISHED", "ARCHIVED"].map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}</select></div>
          <div className="md:col-span-2"><label className="luxury-label">Description</label><textarea className="luxury-input min-h-32" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <label className="flex items-center gap-3 text-sm text-neutral-600"><input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} /> Feature this product</label>
        </section>
        <div className="flex gap-3">
          <button type="submit" disabled={isSaving || !canSave} className="luxury-button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? "Saving…" : "Save changes"}</button>
          <button type="button" onClick={() => router.push("/admin/products")} className="border border-slate-border px-5 py-3 text-xs uppercase tracking-wider text-neutral-600 hover:bg-ivory">Back to products</button>
        </div>
      </form>
    </div>
  );
}
