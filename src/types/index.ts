export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  rating?: number;
  image: string;
  stock: number;
  featured: boolean;
}

export const IMAGE_CONFIG = {
  width: 800,
  quality: 80,
} as const;

export function buildProductImageUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${IMAGE_CONFIG.width}&q=${IMAGE_CONFIG.quality}`;
}

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt?: Date;
}

export interface CartItemType {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItemType[];
  totalItems: number;
  totalPrice: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingAddress?: ShippingAddress;
  notes?: string | null;
  items?: OrderItem[];
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  name: string;
  lastName: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  lastName: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItemDB {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
}
