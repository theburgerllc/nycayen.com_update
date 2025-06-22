import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock database - same as in other order routes
const mockDatabase = {
  orders: new Map(),
  
  async getOrder(id: string) {
    return this.orders.get(id) || null;
  },
  
  async updateOrder(id: string, updates: any) {
    const existing = this.orders.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updated);
    return updated;
  }
};

const updateStatusSchema = z.object({
  status: z.enum(['open', 'closed', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'partial', 'fulfilled', 'shipped', 'delivered']).optional(),
  paymentIntentId: z.string().optional(),
  paymentError: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

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

    const order = await mockDatabase.getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        total: order.total,
        currency: order.currency,
        updatedAt: order.updatedAt,
      }
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = updateStatusSchema.parse(body);

    // Get existing order
    const existingOrder = await mockDatabase.getOrder(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {};

    if (validatedData.status) {
      updates.status = validatedData.status;
      if (validatedData.status === 'cancelled') {
        updates.cancelledAt = new Date();
      } else if (validatedData.status === 'closed') {
        updates.closedAt = new Date();
      }
    }

    if (validatedData.paymentStatus) {
      updates.paymentStatus = validatedData.paymentStatus;
      
      // Handle payment status specific logic
      if (validatedData.paymentStatus === 'paid') {
        // Payment successful
        if (validatedData.paymentIntentId) {
          updates.paymentReference = validatedData.paymentIntentId;
        }
        
        // Auto-update order status if still open
        if (existingOrder.status === 'open') {
          updates.status = 'open'; // Keep open until fulfilled
        }
        
        // In production, trigger fulfillment workflow
        console.log(`Payment confirmed for order ${existingOrder.orderNumber}`);
        
      } else if (validatedData.paymentStatus === 'failed') {
        // Payment failed
        if (validatedData.paymentError) {
          updates.notes = `Payment failed: ${validatedData.paymentError}`;
        }
        
        console.log(`Payment failed for order ${existingOrder.orderNumber}: ${validatedData.paymentError}`);
      }
    }

    if (validatedData.fulfillmentStatus) {
      updates.fulfillmentStatus = validatedData.fulfillmentStatus;
      
      if (validatedData.fulfillmentStatus === 'shipped' && validatedData.trackingNumber) {
        updates.trackingNumber = validatedData.trackingNumber;
        // In production, send shipping confirmation email
      }
      
      if (validatedData.fulfillmentStatus === 'delivered') {
        // In production, send delivery confirmation
        updates.status = 'closed';
        updates.closedAt = new Date();
      }
    }

    if (validatedData.notes && !updates.notes) {
      updates.notes = validatedData.notes;
    }

    // Update order
    const updatedOrder = await mockDatabase.updateOrder(orderId, updates);

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        fulfillmentStatus: updatedOrder.fulfillmentStatus,
        total: updatedOrder.total,
        currency: updatedOrder.currency,
        updatedAt: updatedOrder.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Error updating order status:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid status update data',
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}