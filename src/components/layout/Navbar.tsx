"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Search, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { cart } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav aria-label="Barra de navegación principal" className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      isScrolled ? "glass-panel py-3 border-white/10" : "bg-transparent py-5 border-transparent"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gradient-text tracking-tight">
          AUROMARKET
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/shop" className="hover:text-primary transition-colors">Tienda</Link>
          <Link href="/categories" className="hover:text-primary transition-colors">Categorías</Link>
          <Link href="/deals" className="hover:text-primary transition-colors">Ofertas</Link>
        </div>

        <div className="flex items-center space-x-5">
          <button aria-label="Buscar productos" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={openCart}
            aria-label={`Carrito de compras, ${cart.totalItems} productos`}
            className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[10px] flex items-center justify-center rounded-full font-bold">
                {cart.totalItems > 9 ? "9+" : cart.totalItems}
              </span>
            )}
          </button>
          
          {isLoading ? (
            <div className="w-8 h-8" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">{user.role}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{user.email}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full transition-all group">
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Ingresar</span>
            </Link>
          )}
          <button aria-label="Abrir menú de navegación" className="md:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
