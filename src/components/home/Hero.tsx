"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Ultra Rápido", desc: "Experimenta navegación sin latencia" },
  { icon: ShieldCheck, title: "Máxima Seguridad", desc: "Encriptación de primer nivel para tu tranquilidad" },
  { icon: ShoppingBag, title: "Curación Premium", desc: "Solo los mejores productos llegan aquí" },
] as const;

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="glass-panel p-8 rounded-3xl text-left hover:border-primary/30 transition-colors group"
    >
      <item.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] -z-10" />
      
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 rounded-full text-primary">
            Bienvenidos al futuro del comercio
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
            Eleva tu <br />
            <span className="gradient-text">Experiencia de Compra</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Descubre una selección curada de productos premium con una interfaz 
            fluida y ultra rápida diseñada para el mundo moderno.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop"               className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all elevated-shadow flex items-center justify-center gap-2 group">
              Empezar a Comprar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              Saber Más
            </Link>
          </div>
        </motion.div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((item, idx) => (
            <FeatureCard key={item.title} item={item} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
