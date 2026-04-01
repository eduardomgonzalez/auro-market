"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import type { Product } from "@/types";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const featured = data.filter((p: Product) => p.featured).slice(0, 4);
        setFeaturedProducts(featured);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero />
      {isLoading ? (
        <div className="container mx-auto px-6 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <FeaturedProducts 
          products={featuredProducts} 
          title="Productos Destacados"
          subtitle="Excelencia seleccionada a mano solo para ti."
        />
      )}
    </div>
  );
}
