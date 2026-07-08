import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock tracking data - in production, fetch from EasyPost or carrier API
    const mockTracking = {
      orderId: id,
      status: "in-transit",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      carrier: "DHL Express",
      trackingNumber: "1234567890",
      currentLocation: {
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
      },
      recipient: {
        name: "John Doe",
        address: "123 Victoria Island, Lagos, Nigeria",
        phone: "+234 801 234 5678",
        email: "john@example.com",
      },
      events: [
        {
          id: "1",
          status: "delivered",
          title: "Order Placed",
          description: "Your order has been confirmed",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Lagos, Nigeria",
        },
        {
          id: "2",
          status: "processing",
          title: "Processing",
          description: "Your order is being prepared for shipment",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Lagos Warehouse",
        },
        {
          id: "3",
          status: "shipped",
          title: "Shipped",
          description: "Your package has been picked up by DHL",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: "DHL Hub, Lagos",
        },
        {
          id: "4",
          status: "in-transit",
          title: "In Transit",
          description: "Your package is on its way to you",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: "In Transit to Lagos",
        },
        {
          id: "5",
          status: "in-transit",
          title: "Out for Delivery",
          description: "Your package is out for delivery today",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: "Victoria Island, Lagos",
        },
      ],
    };

    // In production, you would:
    // 1. Fetch order from database
    // 2. Get tracking number from order
    // 3. Call EasyPost API: https://www.easypost.com/docs/api/node#tracking
    // 4. Format and return tracking data
    // 5. Send SMS/WhatsApp updates via Twilio

    return NextResponse.json(mockTracking);
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}

// Webhook for carrier tracking updates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify webhook signature from carrier
    // Update order tracking status in database
    // Send SMS/WhatsApp notification to customer

    console.log(`Tracking update for order ${id}:`, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
