import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, external_reference, payment_id } = body;

    console.log("=== WEBHOOK MERCADO PAGO ===");
    console.log("Status:", status);
    console.log("External reference:", external_reference);
    console.log("Payment ID:", payment_id);

    if (!external_reference) {
      console.log("No external reference, ignoring");
      return NextResponse.json({ received: true });
    }

    let orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
    
    switch (status) {
      case "approved":
        orderStatus = "CONFIRMED";
        break;
      case "pending":
        orderStatus = "PENDING";
        break;
      case "cancelled":
        orderStatus = "CANCELLED";
        break;
      case "refunded":
        orderStatus = "REFUNDED";
        break;
      default:
        orderStatus = "PENDING";
    }

    console.log("Updating order:", external_reference, "to status:", orderStatus);

    const { prisma } = await import("@/lib/prisma");
    
    const order = await prisma.order.update({
      where: { orderNumber: external_reference },
      data: { status: orderStatus },
    });

    console.log("Order updated successfully:", order.orderNumber);

    return NextResponse.json({ received: true, orderStatus });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error", details: String(error) }, { status: 500 });
  }
}
