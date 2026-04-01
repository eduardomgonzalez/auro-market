import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
