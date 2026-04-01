"use client";

import { useState, useMemo, useEffect } from "react";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";

const MAX_PRICE = 1500;
const CATEGORIES = ["Todos", "Electrónica", "Accesorios", "Hogar", "Moda"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                           product.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") return [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    
    return result;
  }, [products, search, selectedCategory, maxPrice, sortBy]);

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Nuestra <span className="gradient-text">Colección</span></h1>
          <p className="text-muted-foreground text-lg">Explora nuestra lista curada de artículos premium.</p>
        </div>

        {/* Search & Main Category Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar productos..."
              aria-label="Buscar productos por nombre o categoría"
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchProducts}
            className="p-3 hover:bg-white/10 rounded-xl transition-all"
            title="Actualizar productos"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 no-scrollbar">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-4 rounded-2xl border transition-all ${
                showAdvancedFilters ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-8 glass-panel rounded-[32px] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Rango de Precio</h4>
                    <span className="text-xs font-mono text-muted-foreground">${maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1500" 
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    aria-label="Precio máximo"
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
                    <span>$0</span>
                    <span>$1500+</span>
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Ordenar por</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Defecto", value: "default" },
                      { label: "Menor Precio", value: "price-low" },
                      { label: "Mayor Precio", value: "price-high" },
                      { label: "Calificación", value: "rating" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`text-xs px-4 py-2 rounded-xl border transition-all font-bold ${
                          sortBy === opt.value ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats / Quick Info */}
                <div className="hidden md:flex flex-col justify-center items-end text-right border-l border-white/5 pl-12">
                   <p className="text-2xl font-black gradient-text">{filteredProducts.length}</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resultados Encontrados</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          </div>
        ) : (
          <FeaturedProducts 
            products={filteredProducts} 
            title="" 
            subtitle="" 
            showLink={false}
          />
        )}
      </div>
    </div>
  );
}
