import fs from "fs";
import path from "path";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  image: string;
  stock: number;
  featured: boolean;
  description?: string;
}

interface ProductsData {
  products: Product[];
}

const dataPath = path.join(process.cwd(), "src", "data", "products.json");

function readProducts(): Product[] {
  const data = fs.readFileSync(dataPath, "utf-8");
  const parsed: ProductsData = JSON.parse(data);
  return parsed.products;
}

function writeProducts(products: Product[]): void {
  const data: ProductsData = { products };
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export function getAllProducts(): Product[] {
  return readProducts();
}

export function getProductById(id: string): Product | undefined {
  const products = readProducts();
  return products.find((p) => p.id === id);
}

export function createProduct(product: Omit<Product, "id">): Product {
  const products = readProducts();
  const newId = crypto.randomUUID();
  const newProduct = { ...product, id: newId };
  products.push(newProduct);
  writeProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  
  writeProducts(filtered);
  return true;
}

export function getNextProductId(): string {
  const products = readProducts();
  return crypto.randomUUID();
}
