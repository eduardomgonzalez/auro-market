import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: "Producto requerido" }, { status: 400 });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      return NextResponse.json(updatedItem);
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Error al agregar al carrito" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: "Producto requerido" }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      return NextResponse.json({ success: true });
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Error al actualizar carrito" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json({ error: "Error al eliminar del carrito" }, { status: 500 });
  }
}
