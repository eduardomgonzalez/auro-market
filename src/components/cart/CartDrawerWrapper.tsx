"use client";

import { useCartDrawer } from "@/context/CartDrawerContext";
import CartDrawer from "./CartDrawer";

export default function CartDrawerWrapper() {
  const { isOpen, closeCart } = useCartDrawer();

  return <CartDrawer isOpen={isOpen} onClose={closeCart} />;
}
