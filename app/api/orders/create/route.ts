import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Order, Cart } from '../../../shop/types';

// Validation schema for order creation
const createOrderSchema = z.object({
  cart: z.object({
    id: z.string(),
    items: z.array(z.object({
      id: z.string(),
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      totalPrice: z.number().min(0),
      selectedVariants: z.record(z.string()).optional(),
    })),
    subtotal: z.number().min(0),
    tax: z.number().min(0),
    shipping: z.number().min(0),
    discount: z.number().min(0),
    total: z.number().min(0),
    currency: z.string(),
    couponCode: z.string().optional(),
  }),
  customerInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    shippingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      company: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      country: z.string().min(1),
      phone: z.string().optional(),
    }),
    billingAddress: z.object({
      firstName: z.string(),
      lastName: z.string(),
      company: z.string().optional(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    }).optional(),
    sameAsShipping: z.boolean().default(true),
  }),
  shippingMethod: z.string(),
  paymentIntentId: z.string(),
});

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `NM${timestamp}${random}`.toUpperCase();
}

// Mock database functions - in production, replace with actual database calls
const mockDatabase = {
  orders: new Map<string, Order>(),
  
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: generateOrderNumber(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.orders.set(order.id, order);
    return order;
  },
  
  async getOrder(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  },
  
  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createOrderSchema.parse(body);
    const { cart, customerInfo, shippingMethod, paymentIntentId } = validatedData;

    // Security validation: Check cart total calculation
    const calculatedSubtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (Math.abs(calculatedSubtotal - cart.subtotal) > 0.01) {
      return NextResponse.json(
        { error: 'Cart total validation failed' },
        { status: 400 }
      );
    }

    // Check inventory availability (mock implementation)
    for (const item of cart.items) {
      // In production, check actual inventory
      const mockStock = 100; // Mock stock check
      if (item.quantity > mockStock) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Prepare order data
    const billingAddress = customerInfo.sameAsShipping 
      ? customerInfo.shippingAddress 
      : customerInfo.billingAddress || customerInfo.shippingAddress;

    const orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      email: customerInfo.email,
      phone: customerInfo.phone,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        productTitle: `Product ${item.productId}`, // In production, fetch from product database
        variantTitle: item.selectedVariants ? Object.values(item.selectedVariants).join(', ') : undefined,
        sku: `SKU-${item.productId}`, // In production, get actual SKU
        weight: 0, // In production, calculate from product data
        image: undefined, // In production, get product image
        variantId: item.selectedVariants ? Object.keys(item.selectedVariants)[0] : undefined,
      })),
      shippingAddress: customerInfo.shippingAddress,
      billingAddress: billingAddress,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      currency: cart.currency,
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      status: 'open',
      paymentMethod: 'card', // Will be updated after payment confirmation
      paymentReference: paymentIntentId,
      shippingMethod: shippingMethod,
      notes: cart.couponCode ? `Coupon applied: ${cart.couponCode}` : undefined,
      tags: [],
    };

    // Create order in database
    const order = await mockDatabase.createOrder(orderData);

    // Log order creation
    console.log(`Order created: ${order.orderNumber} for ${customerInfo.email}`);

    // In production, you might want to:
    // 1. Send order confirmation email
    // 2. Update inventory
    // 3. Trigger fulfillment workflows
    // 4. Send to analytics/tracking systems

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }
    });

  } catch (error: any) {
    console.error('Error creating order:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid order data',
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}