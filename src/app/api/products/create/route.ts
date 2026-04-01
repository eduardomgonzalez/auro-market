import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, category, rating, image, stock, featured, description } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, price, category" },
        { status: 400 }
      );
    }

    const finalDescription = description && description.trim() !== "" 
      ? description 
      : `${name} - Producto de alta calidad`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        category,
        rating: rating || 4.5,
        image: image || `https://picsum.photos/seed/${Date.now()}/800/800`,
        stock: Number(stock) || 0,
        featured: Boolean(featured),
        description: finalDescription,
        active: true,
      },
    });

    return NextResponse.json({
      ...newProduct,
      price: Number(newProduct.price),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error al crear producto: ${errorMessage}` }, { status: 500 });
  }
}
