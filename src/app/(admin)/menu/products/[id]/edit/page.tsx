"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CloudUpload,
  ChevronLeft,
  Monitor,
  Printer,
  Tablet,
  X,
} from "lucide-react";
import { useProduct } from "@/hooks/queries/useProduct";
import { useUpdateProduct } from "@/hooks/mutations/useUpdateProduct";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#ff4d00]" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState({ website: true, pos: true, kiosk: true });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when product loads
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description ?? "");
    if (product.availability) {
      setAvailability({
        website: product.availability.website ?? true,
        pos: product.availability.pos ?? true,
        kiosk: product.availability.kiosk ?? true,
      });
    }
  }, [product]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Product name is required.");

    updateProduct(
      {
        id,
        payload: {
          name: name.trim(),
          description: description.trim() || undefined,
          availability,
          ...(newImage && { mainImage: newImage }),
        },
      },
      {
        onSuccess: () => router.push("/menu/products"),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
          const backendMsg = axiosErr?.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(", ")
            : backendMsg ?? (err instanceof Error ? err.message : "Failed to update product.");
          setError(msg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-white/40 text-sm">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-red-400 text-sm">Product not found.</p>
      </div>
    );
  }

  const currentImage = imagePreview ?? product.mainImage ?? null;

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/menu/products"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Left */}
          <div className="flex-1 space-y-5">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-red-400">*</span> Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Product Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write product description"
                rows={4}
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none"
              />
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/50">Category</label>
                <div className="bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40">
                  {typeof product.categoryId === "object"
                    ? product.categoryId.name
                    : product.categoryId}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/50">Type</label>
                <div className="bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 capitalize">
                  {product.type}
                </div>
              </div>
            </div>

            {/* Price info (read-only) */}
            {product.type === "single" && product.price !== undefined && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/50">Price (Kr.)</label>
                <div className="bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40">
                  {product.price.toLocaleString()}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-65 shrink-0 space-y-5">
            {/* Main Image */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Main Image</label>
              <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                {currentImage ? (
                  <div className="relative w-full aspect-square">
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={newImage ? removeNewImage : () => imageRef.current?.click()}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      {newImage ? <X size={14} /> : (
                        <CloudUpload size={14} />
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageRef.current?.click()}
                    className="p-6 text-center cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
                    <p className="text-sm text-white/40">Upload an image</p>
                    <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG · 220×220 px</p>
                  </div>
                )}
              </div>
              {currentImage && (
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className="w-full py-2 text-xs text-white/40 hover:text-white border border-white/10 rounded-xl transition-colors"
                >
                  Change Image
                </button>
              )}
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Availability</label>
              {(
                [
                  { key: "website" as const, label: "Website", Icon: Monitor },
                  { key: "pos" as const, label: "POS", Icon: Printer },
                  { key: "kiosk" as const, label: "KIOSK", Icon: Tablet },
                ] as const
              ).map(({ key, label, Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="text-white/50" />
                    <span className="text-sm text-white">{label}</span>
                  </div>
                  <Toggle
                    value={availability[key]}
                    onChange={(v) => setAvailability((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
