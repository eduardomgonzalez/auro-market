import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth/auth";
import prisma from "@/lib/prisma";
import { Preference, MercadoPagoConfig } from "mercadopago";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 10000,
  }
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const preferenceItems = items.map((item: { id: string; title: string; price: number; quantity: number }) => ({
      id: String(item.id),
      title: String(item.title),
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    if (shippingCost > 0) {
      preferenceItems.push({
        id: "shipping",
        title: "Costo de envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS",
      });
    }

    const preference = new Preference(config);

    console.log("Creating preference with items:", preferenceItems.length);

    const result = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: orderNumber,
        notification_url: `${process.env.AUTH_URL}/api/mercadopago/webhook`,
        back_urls: {
          success: `${process.env.AUTH_URL}/cart?payment=success&order=${orderNumber}`,
          failure: `${process.env.AUTH_URL}/cart?payment=failure&order=${orderNumber}`,
          pending: `${process.env.AUTH_URL}/cart?payment=pending&order=${orderNumber}`,
        },
        auto_return: "approved",
        statement_descriptor: "AUROMARKET",
        binary_mode: false,
      },
    });

    console.log("Preference created:", result.id);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "PENDING",
        subtotal,
        shippingCost,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        notes,
        items: {
          create: items.map((item: { id: string; quantity: number; price: number }) => ({
            productId: String(item.id),
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log("Order created:", order.orderNumber, "with status PENDING");

    return NextResponse.json({
      preferenceId: result.id,
      orderId: order.id,
      orderNumber,
      initPoint: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

  } catch (error) {
    console.error("=== ERROR creating preference ===");
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error al procesar: ${errorMessage}` }, { status: 500 });
  }
}
