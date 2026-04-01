import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth/auth";
import prisma from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/constants/products";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.product.deleteMany({});

    const createdProducts = [];

    for (const product of MOCK_PRODUCTS) {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          description: `${product.name} - Producto de alta calidad`,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          featured: product.featured,
          active: true,
          rating: product.rating || 4.5,
        },
      });
      createdProducts.push(created);
    }

    return NextResponse.json({
      message: `Se insertaron ${createdProducts.length} productos con IDs profesionales`,
      products: createdProducts,
    });

  } catch (error) {
    console.error("Error seeding products:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error al insertar productos: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.product.deleteMany({});

    return NextResponse.json({ message: "Todos los productos y pedidos fueron eliminados" });

  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json({ error: "Error al limpiar datos" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const products = await prisma.product.findMany();
    let fixedCount = 0;

    for (const product of products) {
      if (!product.description || product.description === "EMPTY" || product.description.trim() === "") {
        await prisma.product.update({
          where: { id: product.id },
          data: { description: `${product.name} - Producto de alta calidad` },
        });
        fixedCount++;
      }
    }

    return NextResponse.json({ message: `Se corrigieron ${fixedCount} descripciones` });

  } catch (error) {
    console.error("Error fixing descriptions:", error);
    return NextResponse.json({ error: "Error al corregir descripciones" }, { status: 500 });
  }
}
