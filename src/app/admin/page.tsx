"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Users, ShoppingCart, Plus, Pencil, Trash2, RefreshCw, ChevronRight, X, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import ProductModal from "@/components/admin/ProductModal";
import { showConfirm, AlertModal } from "@/components/ui/AlertModal";

const CATEGORIES = ["Electrónica", "Accesorios", "Hogar", "Moda"];

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }>;
}

interface UserType {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

type TabType = "products" | "orders" | "users";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setOrders(data);
      const totalRevenue = data.reduce((sum: number, order: Order) => sum + Number(order.total), 0);
      setStats(prev => ({ ...prev, totalOrders: data.length, totalRevenue }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
      setStats(prev => ({ ...prev, totalUsers: data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()]);
    setStats(prev => ({ ...prev, totalProducts: products.length }));
    setIsLoading(false);
  }, [fetchProducts, fetchOrders, fetchUsers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setStats(prev => ({ ...prev, totalProducts: products.length }));
  }, [products.length]);

  const handleSaveProduct = async (productData: Omit<Product, "id">) => {
    try {
      const isEditing = editingProduct !== null;
      const url = isEditing
        ? `/api/products/${editingProduct.id}`
        : "/api/products/create";
      
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }
      
      const savedProduct = await res.json();
      setSuccessMessage(isEditing 
        ? `Producto "${savedProduct.name}" actualizado correctamente` 
        : `Producto "${savedProduct.name}" creado correctamente`
      );
      setError(null);
      await fetchProducts();
      setModalOpen(false);
      setEditingProduct(null);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSuccessMessage(null);
    }
  };

  const handleDeleteProduct = async (id: string, productName: string) => {
    const confirmed = await showConfirm({
      type: "warning",
      title: "¿Eliminar producto?",
      message: `¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
    
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setSuccessMessage(`Producto "${productName}" eliminado correctamente`);
      setError(null);
      await fetchProducts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setSuccessMessage(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      setSuccessMessage("Estado del pedido actualizado");
      await fetchOrders();
      setOrderDetails(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Error al actualizar rol");
      setSuccessMessage("Rol del usuario actualizado");
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleSeedProducts = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSuccessMessage(data.message);
      await fetchProducts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al insertar productos");
    }
  };

  const handleFixDescriptions = async () => {
    try {
      const res = await fetch("/api/seed", { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir descripciones");
    }
  };

  const statsData = [
    { label: "Productos", value: stats.totalProducts, icon: Package, color: "text-blue-400" },
    { label: "Pedidos", value: stats.totalOrders, icon: ShoppingCart, color: "text-green-400" },
    { label: "Usuarios", value: stats.totalUsers, icon: Users, color: "text-purple-400" },
    { label: "Ingresos", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-yellow-400" },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    CONFIRMED: "bg-blue-500/10 text-blue-400",
    PROCESSING: "bg-purple-500/10 text-purple-400",
    SHIPPED: "bg-indigo-500/10 text-indigo-400",
    DELIVERED: "bg-green-500/10 text-green-400",
    CANCELLED: "bg-red-500/10 text-red-400",
    REFUNDED: "bg-gray-500/10 text-gray-400",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">
              Panel de <span className="text-primary">Administración</span>
            </h1>
            <p className="text-muted-foreground">Gestiona tu negocio desde un solo lugar.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAll}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition-all"
              title="Actualizar datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            {activeTab === "products" && (
              <>
                <button
                  onClick={handleFixDescriptions}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold rounded-2xl hover:bg-yellow-500/30 transition-all"
                  title="Corregir descripciones vacías"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSeedProducts}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all"
                  title="Resetear productos"
                >
                  <Database className="w-5 h-5" />
                  {products.length === 0 ? "Insertar" : "Resetear"}
                </button>
              </>
            )}
            {activeTab === "products" && products.length > 0 && (
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl elevated-shadow hover:bg-primary/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Agregar Producto
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Cerrar</button>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat) => (
            <div key={stat.label} className="glass-panel p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-3xl font-black">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-bold rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "products"
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Productos
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-bold rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-bold rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Usuarios
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 overflow-x-auto">
                <h3 className="text-xl font-bold">Inventario de Productos</h3>
              </div>
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold">{product.name}</p>
                            {product.featured && (
                              <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-medium">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          product.stock > 10
                            ? "bg-green-500/10 text-green-400"
                            : product.stock > 0
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {product.stock > 10 ? "En stock" : product.stock > 0 ? "Stock bajo" : "Sin stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            aria-label={`Editar ${product.name}`}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            aria-label={`Eliminar ${product.name}`}
                            className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay productos registrados.</p>
                  <button onClick={openAddModal} className="mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">
                    Agregar tu primer producto
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold">Pedidos Recientes</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Orden</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.user.name || "Usuario"}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-6 py-4 font-bold">${Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setOrderDetails(order)}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay pedidos registrados.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold">Usuarios Registrados</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Pedidos</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name || "Sin nombre"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          user.role === "ADMIN" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {user.role === "ADMIN" ? "Admin" : "Usuario"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{user._count.orders}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <option value="USER" className="text-black">Usuario</option>
                          <option value="ADMIN" className="text-black">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay usuarios registrados.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <Link href="/shop" className="text-sm text-primary font-bold hover:underline">
            Ver tienda →
          </Link>
        </div>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <AnimatePresence>
        {orderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOrderDetails(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-panel rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Detalle del Pedido</h3>
                  <p className="text-sm text-muted-foreground font-mono">{orderDetails.orderNumber}</p>
                </div>
                <button onClick={() => setOrderDetails(null)} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{orderDetails.user.name || "Usuario"}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{new Date(orderDetails.createdAt).toLocaleString("es-MX")}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Estado</p>
                  <select
                    value={orderDetails.status}
                    onChange={(e) => handleUpdateOrderStatus(orderDetails.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">Productos</p>
                  <div className="space-y-3">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(orderDetails.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>${Number(orderDetails.shippingCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-primary">${Number(orderDetails.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertModal />
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
