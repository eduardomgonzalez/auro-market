"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, CreditCard, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

function PaymentStatusHandler({ onStatus }: { onStatus: (status: string, orderNum: string) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const payment = searchParams.get("payment");
    const order = searchParams.get("order");
    
    if (payment && order) {
      onStatus(payment, order);
    }
  }, [searchParams, onStatus]);
  
  return null;
}

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { data: session } = useSession();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [shippingCost] = useState(cart.totalPrice > 500 ? 0 : 50);
  const [error, setError] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    lastName: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const handlePaymentReturn = async (status: string, orderNum: string) => {
    setPaymentStatus(status);
    setOrderNumber(orderNum);
    
    if (status === "success") {
      try {
        const res = await fetch(`/api/orders?orderNumber=${orderNum}`);
        const data = await res.json();
        
        if (data.status === "CONFIRMED") {
          setOrderSuccess(true);
          clearCart();
        } else {
          setError("El pago está siendo procesado. El pedido se actualizará cuando Mercado Pago confirme.");
        }
      } catch {
        setError("No se pudo verificar el estado del pedido.");
      }
    } else if (status === "failure") {
      setError("El pago fue rechazado. Puedes intentar de nuevo.");
    } else if (status === "pending") {
      setError("El pago está pendiente. Te notificaremos cuando se confirme.");
    }
  };

  if (orderSuccess) {
    return (
      <>
        <Suspense fallback={null}>
          <PaymentStatusHandler onStatus={handlePaymentReturn} />
        </Suspense>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-black mb-4">¡Pedido Confirmado!</h1>
            <p className="text-muted-foreground mb-2">
              Tu pedido ha sido creado exitosamente.
            </p>
            <p className="text-sm text-primary font-bold mb-8">
              Número de pedido: {orderNumber}
            </p>
            <div className="space-y-4">
              <Link
                href="/shop"
                className="block w-full py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all"
              >
                Continuar Comprando
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (cart.items.length === 0 && !paymentStatus) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Parece que aún no has agregado productos a tu carrito. 
            Explora nuestra colección y encuentra algo especial.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all"
          >
            Explorar Productos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus) {
    return (
      <>
        <Suspense fallback={null}>
          <PaymentStatusHandler onStatus={handlePaymentReturn} />
        </Suspense>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {paymentStatus === "success" ? (
            <>
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="text-3xl font-black mb-4">¡Pago Aprobado!</h1>
              <p className="text-muted-foreground mb-2">Tu pedido #{orderNumber} está siendo procesado.</p>
            </>
          ) : paymentStatus === "pending" ? (
            <>
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
              </div>
              <h1 className="text-3xl font-black mb-4">Pago Pendiente</h1>
              <p className="text-muted-foreground mb-2">Tu pedido #{orderNumber} está esperando confirmación.</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h1 className="text-3xl font-black mb-4">Pago Rechazado</h1>
              <p className="text-muted-foreground mb-6">{error || "Tu pago no fue aprobado. Intenta de nuevo."}</p>
            </>
          )}
          <div className="space-y-4">
            <Link
              href="/cart"
              className="block w-full py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all"
              onClick={() => setPaymentStatus(null)}
            >
              Volver al Carrito
            </Link>
            <Link
              href="/shop"
              className="block w-full py-3 text-muted-foreground hover:text-white transition-colors"
            >
              Continuar Comprando
            </Link>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  const handleCheckout = async () => {
    setError(null);
    
    if (!session?.user) {
      setError("Debes iniciar sesión para continuar");
      return;
    }

    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      setError("Por favor completa todos los campos de envío");
      return;
    }

    setIsProcessing(true);

    try {
      const items = cart.items.map(item => ({
        id: item.product.id,
        title: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          notes: shippingAddress.notes,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsProcessing(false);
        return;
      }

      setOrderNumber(data.orderNumber);
      
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setOrderSuccess(true);
        clearCart();
      }
    } catch (error) {
      console.error("=== ERROR COMPLETO ===");
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("=== MENSAJE ===");
      console.error(errorMessage);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black mb-2">
              Finalizar <span className="gradient-text">Compra</span>
            </h1>
            <p className="text-muted-foreground mb-12">Completa tus datos para realizar el pedido</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-3xl p-8 border border-white/10"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Datos de Envío
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm font-mono whitespace-pre-wrap">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Nombre</label>
                    <input
                      type="text"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Apellido</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Calle</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="Av. Rivadavia"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Número</label>
                    <input
                      type="text"
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="1234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="Buenos Aires"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Provincia</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="CABA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="C1001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Notas del pedido (opcional)</label>
                  <textarea
                    value={shippingAddress.notes}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Indicaciones especiales para el delivery..."
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass-panel rounded-3xl p-8 border border-white/10">
                <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className={shippingCost === 0 ? "text-green-400" : ""}>
                      {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">Envío gratis en compras mayores a $500</p>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="gradient-text">${(cart.totalPrice + shippingCost).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pagar con Mercado Pago
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Serás redirigido a Mercado Pago para completar el pago de forma segura.
                </p>
              </div>

              <button
                onClick={() => setShowCheckout(false)}
                className="w-full py-3 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                ← Volver al carrito
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Carrito de <span className="gradient-text">Compras</span>
          </h1>
          <p className="text-muted-foreground mb-12">
            Tienes {cart.totalItems} {cart.totalItems === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, idx) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10"
              >
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-primary uppercase tracking-widest">
                        {item.product.category}
                      </span>
                      <h3 className="font-bold text-lg mt-1">{item.product.name}</h3>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      aria-label={`Eliminar ${item.product.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        ${item.product.price.toFixed(2)} c/u
                      </p>
                      <p className="text-xl font-black text-primary">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 glass-panel rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={`font-medium ${shippingCost === 0 ? "text-green-400" : ""}`}>
                    {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">Envío gratis en compras mayores a $500</p>
                )}
                <div className="border-t border-white/10 pt-4 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black gradient-text">${(cart.totalPrice + shippingCost).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mb-4"
              >
                Proceder al Pago
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              >
                Vaciar carrito
              </button>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
