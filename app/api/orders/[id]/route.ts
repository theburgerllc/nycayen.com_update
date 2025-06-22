import { NextRequest, NextResponse } from 'next/server';

// Mock database - same as in create route
const mockDatabase = {
  orders: new Map(),
  
  async getOrder(id: string) {
    return this.orders.get(id) || null;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await mockDatabase.getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Return order data (exclude sensitive information)
    const safeOrder = {
      ...order,
      // Remove sensitive payment information if needed
    };

    return NextResponse.json(safeOrder);

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}