import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Mock user database - in production, replace with actual database
const mockUserDatabase = {
  users: new Set([
    'existing@example.com',
    'test@nycayenmoore.com',
    'admin@nycayenmoore.com',
  ]),
  
  async emailExists(email: string): Promise<boolean> {
    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.users.has(email.toLowerCase());
  },
  
  async createUser(email: string, password?: string): Promise<void> {
    // In production, hash password and store in database
    this.users.add(email.toLowerCase());
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email } = checkEmailSchema.parse(body);

    // Rate limiting - basic implementation
    // In production, use proper rate limiting with Redis or similar
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check if email already exists
    const emailExists = await mockUserDatabase.emailExists(email);

    if (emailExists) {
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please use a different email or sign in instead.',
          exists: true 
        },
        { status: 400 }
      );
    }

    // Email is available
    return NextResponse.json({
      available: true,
      message: 'Email is available for account creation'
    });

  } catch (error: any) {
    console.error('Error checking email:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          details: error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to validate email. Please try again.' },
      { status: 500 }
    );
  }
}