"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart, Eye, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  showLink?: boolean;
}

export default function FeaturedProducts({ 
  products, 
  title = "Explora el Catálogo", 
  subtitle = "Productos premium seleccionados para tu estilo de vida.",
  showLink = true 
}: FeaturedProductsProps) {
  const { addItem, isInCart } = useCart();
  const { openCart } = useCartDrawer();
  const titleWords = title.split(" ");
  const lastWordIndex = titleWords.length - 1;

  const handleAddToCart = (product: Product) => {
    addItem(product);
    openCart();
  };

  return (
    <section className="container mx-auto px-6">
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {titleWords.map((word, i) => (
                <span key={i} className={i === lastWordIndex ? "text-primary" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {showLink && (
            <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-foreground transition-colors">
              Ver Todos los Productos →
            </Link>
          )}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-white/5 border border-white/10 elevated-shadow">
                <img 
                  src={product.image} 
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Agregar ${product.name} al carrito`}
                    className="p-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <Link 
                    href={`/product/${product.id}`} 
                    aria-label={`Ver detalles de ${product.name}`}
                    className="p-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary uppercase tracking-widest">{product.category}</span>
                  <div className="flex items-center text-xs text-yellow-500" aria-label={`Calificación: ${product.rating} de 5 estrellas`}>
                    <Star className="w-3 h-3 fill-current mr-1" aria-hidden="true" />
                    <span>{product.rating}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xl font-black">${product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
          <p className="text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </section>
  );
}
