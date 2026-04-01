"use client";

import { Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/types";

const DEFAULT_GUEST_EMAIL = "invitado@auro.com";
const DEFAULT_PASSWORD = "user123";

function getRedirectPath(role: UserRole): string {
  return role === "ADMIN" ? "/admin" : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email || DEFAULT_GUEST_EMAIL,
        password: password || DEFAULT_PASSWORD,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas. Intenta de nuevo.");
      } else {
        const role: UserRole = email.includes("@admin") ? "ADMIN" : "USER";
        router.push(getRedirectPath(role));
        router.refresh();
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 md:p-16 rounded-[40px] w-full max-w-xl border border-white/10 elevated-shadow"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Bienvenido de <span className="gradient-text">Nuevo</span></h1>
          <p className="text-muted-foreground">Inicia sesión para continuar tu experiencia premium.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              aria-label="Iniciar sesión con Google"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2" role="status" aria-live="polite">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Redirigiendo...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
            <button 
              aria-label="Iniciar sesión con GitHub (próximamente)" 
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition-all text-white opacity-60 cursor-not-allowed"
              disabled
            >
              <Github className="w-5 h-5" />
              Continuar con GitHub
            </button>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">o con email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {error && (
            <div role="alert" className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} aria-label="Formulario de inicio de sesión" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Correo Electrónico</label>
              <input 
                id="email"
                type="email" 
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Contraseña</label>
              <input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="bg-white/5 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">Cuentas de prueba:</p>
            <p>Admin: admin@auro.com / admin123</p>
            <p>Usuario: usuario@gmail.com / user123</p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿No tienes una cuenta? <Link href="/register" className="text-primary font-bold hover:underline">Regístrate gratis</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
