"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  
  return (
    <footer aria-label="Pie de página" className="border-t border-white/5 bg-background py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-xl font-bold gradient-text">AUROMARKET</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Revolucionando tu forma de comprar. Mercado moderno, rápido y seguro para todos.
          </p>
        </div>
        
        <nav aria-label="Enlaces de la tienda">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/categories" className="hover:text-white transition-colors">Todas las Categorías</Link></li>
            <li><Link href="/featured" className="hover:text-white transition-colors">Destacados</Link></li>
            <li><Link href="/new" className="hover:text-white transition-colors">Novedades</Link></li>
          </ul>
        </nav>

        <nav aria-label="Enlaces de la compañía">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Compañía</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
          </ul>
        </nav>

        {isAdmin && (
          <nav aria-label="Enlaces de administración">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Admin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/admin" className="hover:text-primary transition-colors font-medium text-primary/80">Panel de Control</Link></li>
            </ul>
          </nav>
        )}
      </div>
      
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
        © {CURRENT_YEAR} AuroMarket. Todos los derechos reservados.
      </div>
    </footer>
  );
}
