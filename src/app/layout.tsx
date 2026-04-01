import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawerWrapper from "@/components/cart/CartDrawerWrapper";
import { AlertModal } from "@/components/ui/AlertModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuroMarket | Modern Marketplace",
  description: "Experience the future of e-commerce with AuroMarket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen selection:bg-primary/30 flex flex-col`}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          <AuthProvider>
            <CartProvider>
              <CartDrawerProvider>
                <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                <Navbar />
                <CartDrawerWrapper />
                <AlertModal />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </CartDrawerProvider>
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
