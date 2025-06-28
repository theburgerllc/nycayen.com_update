// Enterprise Authentication System with 2FA
'use client';

import { z } from 'zod';
import crypto from 'crypto';
import { Security, ValidationSchemas } from './security';

// Authentication Configuration
export const AUTH_CONFIG = {
  // JWT Settings
  JWT: {
    SECRET_KEY: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    ALGORITHM: 'HS256' as const,
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ISSUER: 'nycayen.com',
    AUDIENCE: 'nycayen-users',
  },
  // 2FA Settings
  TWO_FA: {
    ISSUER: 'NYC Ayen Moore',
    DIGITS: 6,
    PERIOD: 30, // seconds
    WINDOW: 1, // Allow 1 step before/after current time
    BACKUP_CODES_COUNT: 10,
  },
  // Session Settings
  SESSION: {
    COOKIE_NAME: 'auth-session',
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  // Password Reset
  PASSWORD_RESET: {
    TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
    MAX_ATTEMPTS: 3,
    COOLDOWN_PERIOD: 24 * 60 * 60 * 1000, // 24 hours
  },
  // Email Verification
  EMAIL_VERIFICATION: {
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    RESEND_COOLDOWN: 5 * 60 * 1000, // 5 minutes
  },
};

// Authentication Schemas
export const AuthSchemas = {
  register: z.object({
    email: ValidationSchemas.email,
    password: ValidationSchemas.password,
    firstName: ValidationSchemas.name,
    lastName: ValidationSchemas.name,
    phone: ValidationSchemas.phone,
    agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
    agreeToPrivacy: z.boolean().refine(val => val === true, 'Must agree to privacy policy'),
  }),

  login: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, 'Password required'),
    rememberMe: z.boolean().optional(),
    twoFactorCode: z.string().optional().refine(
      code => !code || /^\d{6}$/.test(code), 
      '2FA code must be 6 digits'
    ),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: ValidationSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password required'),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token required'),
    password: ValidationSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password required'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  requestPasswordReset: z.object({
    email: ValidationSchemas.email,
  }),

  setup2FA: z.object({
    password: z.string().min(1, 'Password required for 2FA setup'),
  }),

  verify2FA: z.object({
    code: z.string().refine(code => /^\d{6}$/.test(code), '2FA code must be 6 digits'),
    backupCode: z.string().optional(),
  }),
};

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginCount: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  expiresAt: Date;
  twoFactorVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Two-Factor Authentication Class
export class TwoFactorAuth {
  private static readonly BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  static generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    let secret = '';
    
    for (let i = 0; i < buffer.length; i++) {
      secret += this.BASE32_CHARS[buffer[i] % 32];
    }
    
    return secret;
  }

  static generateQRCodeUrl(email: string, secret: string): string {
    const issuer = encodeURIComponent(AUTH_CONFIG.TWO_FA.ISSUER);
    const account = encodeURIComponent(email);
    const encodedSecret = encodeURIComponent(secret);
    
    return `otpauth://totp/${issuer}:${account}?secret=${encodedSecret}&issuer=${issuer}&digits=${AUTH_CONFIG.TWO_FA.DIGITS}&period=${AUTH_CONFIG.TWO_FA.PERIOD}`;
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < AUTH_CONFIG.TWO_FA.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    
    return codes;
  }

  static verifyToken(secret: string, token: string): boolean {
    if (!secret || !token || !/^\d{6}$/.test(token)) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(currentTime / AUTH_CONFIG.TWO_FA.PERIOD);
    
    // Check current time step and adjacent steps (for clock drift tolerance)
    for (let i = -AUTH_CONFIG.TWO_FA.WINDOW; i <= AUTH_CONFIG.TWO_FA.WINDOW; i++) {
      const testTimeStep = timeStep + i;
      const expectedToken = this.generateTOTP(secret, testTimeStep);
      
      if (token === expectedToken) {
        return true;
      }
    }
    
    return false;
  }

  private static generateTOTP(secret: string, timeStep: number): string {
    const key = this.base32ToBuffer(secret);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(timeStep, 4);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);
    
    return (code % Math.pow(10, AUTH_CONFIG.TWO_FA.DIGITS)).toString().padStart(AUTH_CONFIG.TWO_FA.DIGITS, '0');
  }

  private static base32ToBuffer(base32: string): Buffer {
    const cleanBase32 = base32.toUpperCase().replace(/=+$/, '');
    const buffer = Buffer.alloc(Math.ceil(cleanBase32.length * 5 / 8));
    
    let bits = 0;
    let value = 0;
    let index = 0;
    
    for (const char of cleanBase32) {
      const charIndex = this.BASE32_CHARS.indexOf(char);
      if (charIndex === -1) throw new Error('Invalid base32 character');
      
      value = (value << 5) | charIndex;
      bits += 5;
      
      if (bits >= 8) {
        buffer[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }
    
    return buffer.slice(0, index);
  }

  static hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  static verifyBackupCode(hashedCode: string, providedCode: string): boolean {
    const hashedProvided = this.hashBackupCode(providedCode);
    return crypto.timingSafeEqual(Buffer.from(hashedCode), Buffer.from(hashedProvided));
  }
}

// JWT Token Manager
export class JWTManager {
  static async createTokens(payload: any): Promise<AuthTokens> {
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + this.parseExpiry(AUTH_CONFIG.JWT.ACCESS_TOKEN_EXPIRY));
    const refreshTokenExpiry = new Date(now.getTime() + this.parseExpiry(AUTH_CONFIG.JWT.REFRESH_TOKEN_EXPIRY));

    const accessPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(accessTokenExpiry.getTime() / 1000),
      iss: AUTH_CONFIG.JWT.ISSUER,
      aud: AUTH_CONFIG.JWT.AUDIENCE,
    };

    const refreshPayload = {
      userId: payload.userId,
      type: 'refresh',
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(refreshTokenExpiry.getTime() / 1000),
      iss: AUTH_CONFIG.JWT.ISSUER,
      aud: AUTH_CONFIG.JWT.AUDIENCE,
    };

    const accessToken = await this.signToken(accessPayload);
    const refreshToken = await this.signToken(refreshPayload);

    return {
      accessToken,
      refreshToken,
      expiresAt: accessTokenExpiry,
    };
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      const [header, payload, signature] = token.split('.');
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      // Verify signature
      const expectedSignature = await this.sign(`${header}.${payload}`);
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Invalid token signature');
      }

      // Parse payload
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      // Check issuer and audience
      if (decodedPayload.iss !== AUTH_CONFIG.JWT.ISSUER || decodedPayload.aud !== AUTH_CONFIG.JWT.AUDIENCE) {
        throw new Error('Invalid token issuer or audience');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  private static async signToken(payload: any): Promise<string> {
    const header = {
      alg: AUTH_CONFIG.JWT.ALGORITHM,
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = await this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private static async sign(data: string): Promise<string> {
    // Use Node.js crypto for server-side compatibility
    if (typeof window === 'undefined') {
      const { createHmac } = require('crypto');
      return createHmac('sha256', AUTH_CONFIG.JWT.SECRET_KEY)
        .update(data)
        .digest('base64url');
    }
    
    // Fallback to Web Crypto API for client-side
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(AUTH_CONFIG.JWT.SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return Buffer.from(signature).toString('base64url');
  }

  private static parseExpiry(expiry: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid expiry format');

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}

// Authentication Service
export class AuthService {
  private static sessions = new Map<string, AuthSession>();
  private static resetTokens = new Map<string, { userId: string; email: string; expiresAt: Date; attempts: number }>();
  private static verificationTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();

  static async register(data: z.infer<typeof AuthSchemas.register>, context: { ipAddress: string; userAgent: string }): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Validate input
      const validated = AuthSchemas.register.parse(data);
      
      // Check rate limiting
      const rateLimitKey = Security.createRateLimitKey('register', context.ipAddress);
      const rateLimit = Security.rateLimit(rateLimitKey, Security.Config.RATE_LIMITS.EMAIL_CHECK);
      
      if (!rateLimit.allowed) {
        Security.Logger.logRateLimitExceeded(rateLimitKey, context);
        return { success: false, message: 'Too many registration attempts. Please try again later.' };
      }

      // Check for existing user
      const existingUser = await this.findUserByEmail(validated.email);
      if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      // Hash password
      const hashedPassword = await Security.Password.hashPassword(validated.password);
      
      // Create user
      const userId = crypto.randomBytes(16).toString('hex');
      const user: User = {
        id: userId,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        role: 'user',
        emailVerified: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginCount: 0,
      };

      // Save user (in production, save to database)
      await this.saveUser(user, hashedPassword);

      // Send verification email
      await this.sendVerificationEmail(user);

      Security.Logger.log('info', 'USER_REGISTERED', { userId, email: validated.email }, context);

      return {
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        userId,
      };
    } catch (error) {
      Security.Logger.log('error', 'REGISTRATION_FAILED', { error: error.message }, context);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  static async login(data: z.infer<typeof AuthSchemas.login>, context: { ipAddress: string; userAgent: string }): Promise<{ success: boolean; message: string; tokens?: AuthTokens; requires2FA?: boolean; sessionId?: string }> {
    try {
      // Validate input
      const validated = AuthSchemas.login.parse(data);
      
      // Check account lockout
      const lockoutCheck = Security.Password.checkAccountLockout(validated.email);
      if (lockoutCheck.locked) {
        return { 
          success: false, 
          message: `Account temporarily locked. Please try again in ${Math.ceil(lockoutCheck.remainingTime / 60000)} minutes.` 
        };
      }

      // Apply progressive delay from previous failed attempts
      if (lockoutCheck.nextDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, lockoutCheck.nextDelay));
      }

      // Check rate limiting
      const rateLimitKey = Security.createRateLimitKey('login', context.ipAddress);
      const rateLimit = Security.rateLimit(rateLimitKey, Security.Config.RATE_LIMITS.LOGIN_ATTEMPTS);
      
      if (!rateLimit.allowed) {
        Security.Logger.logRateLimitExceeded(rateLimitKey, context);
        return { success: false, message: 'Too many login attempts. Please try again later.' };
      }

      // Find user
      const user = await this.findUserByEmail(validated.email);
      if (!user) {
        Security.Password.recordFailedAttempt(validated.email);
        Security.Logger.logLoginAttempt(false, validated.email, context);
        return { success: false, message: 'Invalid email or password.' };
      }

      // Verify password
      const hashedPassword = await this.getUserPassword(user.id);
      const passwordValid = await Security.Password.verifyPassword(validated.password, hashedPassword);
      
      if (!passwordValid) {
        Security.Password.recordFailedAttempt(validated.email);
        Security.Logger.logLoginAttempt(false, validated.email, context);
        return { success: false, message: 'Invalid email or password.' };
      }

      // Check email verification
      if (!user.emailVerified) {
        return { success: false, message: 'Please verify your email address before logging in.' };
      }

      // Handle 2FA
      if (user.twoFactorEnabled) {
        if (!validated.twoFactorCode) {
          return { success: false, message: '2FA code required.', requires2FA: true };
        }

        const twoFactorValid = TwoFactorAuth.verifyToken(user.twoFactorSecret!, validated.twoFactorCode);
        if (!twoFactorValid) {
          // Check backup codes
          let backupCodeValid = false;
          if (user.backupCodes && validated.twoFactorCode.includes('-')) {
            for (let i = 0; i < user.backupCodes.length; i++) {
              if (TwoFactorAuth.verifyBackupCode(user.backupCodes[i], validated.twoFactorCode)) {
                // Remove used backup code
                user.backupCodes.splice(i, 1);
                await this.updateUser(user);
                backupCodeValid = true;
                break;
              }
            }
          }
          
          if (!backupCodeValid) {
            Security.Password.recordFailedAttempt(validated.email);
            Security.Logger.logLoginAttempt(false, validated.email, context);
            return { success: false, message: 'Invalid 2FA code.' };
          }
        }
      }

      // Successful login
      Security.Password.recordSuccessfulLogin(validated.email);
      
      // Update user login info
      user.lastLogin = new Date();
      user.loginCount += 1;
      await this.updateUser(user);

      // Create session
      const sessionId = Security.Session.createSession(user.id, context.ipAddress, context.userAgent, {
        email: user.email,
        role: user.role,
      });

      // Create JWT tokens
      const tokens = await JWTManager.createTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      });

      // Store session
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        expiresAt: tokens.expiresAt,
        twoFactorVerified: user.twoFactorEnabled,
      };
      this.sessions.set(sessionId, session);

      Security.Logger.logLoginAttempt(true, validated.email, context);

      return {
        success: true,
        message: 'Login successful.',
        tokens,
        sessionId,
      };
    } catch (error) {
      Security.Logger.log('error', 'LOGIN_FAILED', { error: error.message }, context);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  static async setup2FA(userId: string, password: string): Promise<{ success: boolean; message: string; secret?: string; qrCodeUrl?: string; backupCodes?: string[] }> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      // Verify password
      const hashedPassword = await this.getUserPassword(userId);
      const passwordValid = await Security.Password.verifyPassword(password, hashedPassword);
      
      if (!passwordValid) {
        return { success: false, message: 'Invalid password.' };
      }

      if (user.twoFactorEnabled) {
        return { success: false, message: '2FA is already enabled for this account.' };
      }

      // Generate 2FA secret and backup codes
      const secret = TwoFactorAuth.generateSecret();
      const qrCodeUrl = TwoFactorAuth.generateQRCodeUrl(user.email, secret);
      const backupCodes = TwoFactorAuth.generateBackupCodes();

      // Save to user (temporarily - will be confirmed when user verifies)
      user.twoFactorSecret = secret;
      user.backupCodes = backupCodes.map(code => TwoFactorAuth.hashBackupCode(code));
      await this.updateUser(user);

      return {
        success: true,
        message: '2FA setup initiated. Please scan the QR code with your authenticator app.',
        secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      return { success: false, message: '2FA setup failed. Please try again.' };
    }
  }

  static async verify2FA(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.findUserById(userId);
      if (!user || !user.twoFactorSecret) {
        return { success: false, message: 'Invalid 2FA setup.' };
      }

      const codeValid = TwoFactorAuth.verifyToken(user.twoFactorSecret, code);
      if (!codeValid) {
        return { success: false, message: 'Invalid 2FA code.' };
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      await this.updateUser(user);

      return { success: true, message: '2FA has been successfully enabled for your account.' };
    } catch (error) {
      return { success: false, message: '2FA verification failed. Please try again.' };
    }
  }

  static async disable2FA(userId: string, password: string, code?: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      // Verify password
      const hashedPassword = await this.getUserPassword(userId);
      const passwordValid = await Security.Password.verifyPassword(password, hashedPassword);
      
      if (!passwordValid) {
        return { success: false, message: 'Invalid password.' };
      }

      if (!user.twoFactorEnabled) {
        return { success: false, message: '2FA is not enabled for this account.' };
      }

      // Verify 2FA code if provided
      if (code) {
        const codeValid = TwoFactorAuth.verifyToken(user.twoFactorSecret!, code);
        if (!codeValid) {
          return { success: false, message: 'Invalid 2FA code.' };
        }
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.backupCodes = undefined;
      await this.updateUser(user);

      return { success: true, message: '2FA has been disabled for your account.' };
    } catch (error) {
      return { success: false, message: '2FA disable failed. Please try again.' };
    }
  }

  // Helper methods (these would interact with your database in production)
  private static async findUserByEmail(email: string): Promise<User | null> {
    // In production, query your database
    // For now, return null to simulate no existing user
    return null;
  }

  private static async findUserById(id: string): Promise<User | null> {
    // In production, query your database
    return null;
  }

  private static async saveUser(user: User, hashedPassword: string): Promise<void> {
    // In production, save to your database
    console.log('Saving user:', { user, hashedPassword: '***' });
  }

  private static async updateUser(user: User): Promise<void> {
    // In production, update in your database
    console.log('Updating user:', user);
  }

  private static async getUserPassword(userId: string): Promise<string> {
    // In production, get from your database
    return '';
  }

  private static async sendVerificationEmail(user: User): Promise<void> {
    // In production, send actual email
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.EMAIL_VERIFICATION.TOKEN_EXPIRY);
    
    this.verificationTokens.set(token, {
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    console.log('Email verification token:', token);
  }
}

// Main Auth export
export const Auth = {
  Config: AUTH_CONFIG,
  Schemas: AuthSchemas,
  TwoFactor: TwoFactorAuth,
  JWT: JWTManager,
  Service: AuthService,
};

export default Auth;