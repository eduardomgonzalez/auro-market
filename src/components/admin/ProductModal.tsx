"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Product } from "@/types";
import { showConfirm } from "@/components/ui/AlertModal";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Omit<Product, "id">) => void;
}

const CATEGORIES = ["Electrónica", "Accesorios", "Hogar", "Moda"];

export default function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "Electrónica",
    rating: 4.5,
    image: "",
    stock: 0,
    featured: false,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
        rating: product.rating ?? 4.5,
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        description: product.description ?? "",
      });
      setPreviewUrl(product.image);
    } else {
      setForm({
        name: "",
        price: 0,
        category: "Electrónica",
        rating: 4.5,
        image: "",
        stock: 0,
        featured: false,
        description: "",
      });
      setPreviewUrl(null);
    }
  }, [product]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al subir");
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.path }));
      setPreviewUrl(data.path);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-panel rounded-3xl p-8 w-full max-w-lg mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {product ? "Editar Producto" : "Agregar Producto"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                placeholder="Nombre del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Precio ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all text-foreground appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Imagen del Producto
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={previewUrl || form.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={() => setPreviewUrl(null)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            type: "confirm",
                            title: "¿Eliminar imagen?",
                            message: "La URL de la imagen quedará vacía.",
                            confirmText: "Eliminar",
                            cancelText: "Cancelar",
                          });
                          if (confirmed) {
                            setForm((prev) => ({ ...prev, image: "" }));
                            setPreviewUrl(null);
                          }
                        }}
                        className="py-2 px-3 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-lg text-sm text-destructive transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                    {form.image && (
                      <p className="text-xs text-muted-foreground truncate">{form.image}</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 flex flex-col items-center gap-3 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subir imagen</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WebP hasta 5MB</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                O usar URL de imagen
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, image: e.target.value }));
                    if (e.target.value.startsWith("http")) {
                      setPreviewUrl(e.target.value);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                  placeholder="https://... (opcional)"
                />
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(form.image)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    title="Ver preview"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 accent-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Producto destacado
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.name || !form.price}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
