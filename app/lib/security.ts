// Enterprise-Grade Security Utilities
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

// Rate limiting store - in production, use Redis or similar
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked?: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Enhanced Security Configuration
export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMITS: {
    PAYMENT_INTENT: { requests: 10, windowMs: 60000 }, // 10 requests per minute
    ORDER_CREATION: { requests: 5, windowMs: 60000 }, // 5 orders per minute
    EMAIL_CHECK: { requests: 20, windowMs: 60000 }, // 20 email checks per minute
    GENERAL_API: { requests: 100, windowMs: 60000 }, // 100 requests per minute
    LOGIN_ATTEMPTS: { requests: 5, windowMs: 900000 }, // 5 attempts per 15 minutes
    NEWSLETTER_SIGNUP: { requests: 3, windowMs: 300000 }, // 3 signups per 5 minutes
  },
  ALLOWED_ORIGINS: [
    'https://nycayenmoore.com',
    'https://www.nycayenmoore.com',
    'http://localhost:3000', // Development
  ],
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_MAX_AGE: 60 * 60 * 1000, // 1 hour
  // Request Limits
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  // Password Security
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
    MAX_AGE_DAYS: 90,
    SALT_ROUNDS: 12,
  },
  // Session Security
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    RENEWAL_THRESHOLD: 30 * 60 * 1000, // 30 minutes
    SECURE_ONLY: true,
    SAME_SITE: 'strict' as const,
  },
  // Account Lockout
  ACCOUNT_LOCKOUT: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    PROGRESSIVE_DELAYS: [1000, 2000, 5000, 10000, 30000], // milliseconds
  },
};

// Input Validation Schemas
export const ValidationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email too short')
    .max(254, 'Email too long')
    .refine(email => !email.includes('..'), 'Invalid email format')
    .refine(email => !/[<>'"&]/.test(email), 'Email contains invalid characters'),

  password: z.string()
    .min(SECURITY_CONFIG.PASSWORD.MIN_LENGTH, `Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters`)
    .max(128, 'Password too long')
    .refine(pwd => /[A-Z]/.test(pwd), 'Password must contain uppercase letter')
    .refine(pwd => /[a-z]/.test(pwd), 'Password must contain lowercase letter')
    .refine(pwd => /\d/.test(pwd), 'Password must contain number')
    .refine(pwd => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), 'Password must contain special character')
    .refine(pwd => !/(.)\1{2,}/.test(pwd), 'Password cannot have repeated characters')
    .refine(pwd => !/^(password|123456|qwerty|admin)/i.test(pwd), 'Password too common'),

  name: z.string()
    .min(1, 'Name required')
    .max(50, 'Name too long')
    .refine(name => /^[a-zA-Z\s'-]+$/.test(name), 'Name contains invalid characters')
    .refine(name => !/<script|javascript:|data:|vbscript:/i.test(name), 'Invalid name format'),

  phone: z.string()
    .optional()
    .refine(phone => !phone || /^\+?[\d\s\-\(\)]{10,15}$/.test(phone), 'Invalid phone format')
    .refine(phone => !phone || !/<script|javascript:|data:|vbscript:/i.test(phone), 'Invalid phone format'),

  message: z.string()
    .min(1, 'Message required')
    .max(2000, 'Message too long')
    .refine(msg => !/<script|javascript:|data:|vbscript:/i.test(msg), 'Message contains invalid content'),
};

// XSS Protection Class
export class XSSProtection {
  private static readonly DANGEROUS_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /<\s*\w+[^>]*on\w+\s*=[\s\S]*?>/gi,
  ];

  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove dangerous patterns
    let sanitized = input;
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Encode HTML entities
    sanitized = sanitized.replace(/[&<>"'`=\/]/g, char => 
      this.HTML_ENTITIES[char] || char
    );

    return sanitized.trim();
  }

  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/[&<>"'`=\/]/g, char => this.HTML_ENTITIES[char] || char)
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static validateInput(input: string, allowedTags: string[] = []): boolean {
    if (!input || typeof input !== 'string') return true;

    const hasScript = /<script|javascript:|data:|vbscript:/i.test(input);
    if (hasScript) return false;

    if (allowedTags.length === 0) {
      return !/<\w+/i.test(input);
    }

    const tagRegex = /<(\w+)/gi;
    const matches = input.match(tagRegex);
    if (!matches) return true;

    return matches.every(match => {
      const tag = match.replace('<', '').toLowerCase();
      return allowedTags.includes(tag);
    });
  }
}

// SQL Injection Protection Class
export class SQLInjectionProtection {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /'[^']*'|"[^"]*"/g,
    /;|\|\||&&/g,
    /\bUNION\b.*\bSELECT\b/gi,
    /\b(OR|AND)\b.*[=<>]/gi,
    /-{2,}|\/\*|\*\//g,
    /\bxp_cmdshell\b/gi,
    /\bsp_executesql\b/gi,
  ];

  static detectSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  static sanitizeSQLInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove SQL injection patterns
    let sanitized = input;
    this.SQL_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Escape single quotes
    sanitized = sanitized.replace(/'/g, "''");

    return sanitized.trim();
  }

  static validateDatabaseInput(input: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.detectSQLInjection(input)) {
      errors.push('Input contains potential SQL injection');
    }

    if (input.length > 1000) {
      errors.push('Input too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Enhanced CSRF Protection
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number; used: boolean }>();

  static generateToken(): string {
    const token = crypto.randomBytes(SECURITY_CONFIG.CSRF_TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + SECURITY_CONFIG.CSRF_MAX_AGE;
    
    this.tokens.set(token, { token, expires, used: false });
    
    // Cleanup expired tokens
    this.cleanup();
    
    return token;
  }

  static validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;

    if (tokenData.used || Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      return false;
    }

    // Mark token as used (single use)
    tokenData.used = true;
    return true;
  }

  private static cleanup(): void {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (data.expires < now || data.used) {
        this.tokens.delete(token);
      }
    }
  }
}

// Generate CSRF token (legacy function for backward compatibility)
export function generateCSRFToken(): string {
  return CSRFProtection.generateToken();
}

// Verify CSRF token (enhanced)
export function verifyCSRFToken(token: string, expectedToken?: string): boolean {
  if (expectedToken) {
    // Legacy mode - compare with expected token
    if (!token || !expectedToken) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
    } catch {
      return false;
    }
  } else {
    // New mode - validate using CSRFProtection class
    return CSRFProtection.validateToken(token);
  }
}

// Password Security Class
export class PasswordSecurity {
  private static failedAttempts = new Map<string, { 
    count: number; 
    lastAttempt: number; 
    blocked: boolean;
    nextDelay: number;
  }>();

  static async hashPassword(password: string): Promise<string> {
    // Validate password strength
    const validation = ValidationSchemas.password.safeParse(password);
    if (!validation.success) {
      throw new Error(`Weak password: ${validation.error.errors[0].message}`);
    }

    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, SECURITY_CONFIG.PASSWORD.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  static checkAccountLockout(identifier: string): { 
    locked: boolean; 
    remainingTime: number;
    nextDelay: number;
  } {
    const attempts = this.failedAttempts.get(identifier);
    
    if (!attempts) {
      return { locked: false, remainingTime: 0, nextDelay: 0 };
    }

    if (attempts.blocked) {
      const remainingTime = Math.max(0, 
        SECURITY_CONFIG.ACCOUNT_LOCKOUT.LOCKOUT_DURATION - (Date.now() - attempts.lastAttempt)
      );
      
      if (remainingTime === 0) {
        this.failedAttempts.delete(identifier);
        return { locked: false, remainingTime: 0, nextDelay: 0 };
      }
      
      return { locked: true, remainingTime, nextDelay: attempts.nextDelay };
    }

    return { locked: false, remainingTime: 0, nextDelay: attempts.nextDelay };
  }

  static recordFailedAttempt(identifier: string): void {
    const attempts = this.failedAttempts.get(identifier) || { 
      count: 0, 
      lastAttempt: 0, 
      blocked: false,
      nextDelay: SECURITY_CONFIG.ACCOUNT_LOCKOUT.PROGRESSIVE_DELAYS[0]
    };
    
    attempts.count++;
    attempts.lastAttempt = Date.now();
    
    // Progressive delays before blocking
    if (attempts.count < SECURITY_CONFIG.ACCOUNT_LOCKOUT.MAX_ATTEMPTS) {
      const delayIndex = Math.min(
        attempts.count - 1, 
        SECURITY_CONFIG.ACCOUNT_LOCKOUT.PROGRESSIVE_DELAYS.length - 1
      );
      attempts.nextDelay = SECURITY_CONFIG.ACCOUNT_LOCKOUT.PROGRESSIVE_DELAYS[delayIndex];
    } else {
      attempts.blocked = true;
    }
    
    this.failedAttempts.set(identifier, attempts);
  }

  static recordSuccessfulLogin(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateResetToken(): { token: string; hash: string } {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hash };
  }
}

// Session Security Class
export class SessionSecurity {
  private static sessions = new Map<string, {
    userId: string;
    ipAddress: string;
    userAgent: string;
    created: number;
    lastAccess: number;
    data: any;
  }>();

  static createSession(userId: string, ipAddress: string, userAgent: string, data: any = {}): string {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    
    this.sessions.set(sessionId, {
      userId,
      ipAddress,
      userAgent,
      created: now,
      lastAccess: now,
      data,
    });

    // Cleanup old sessions
    this.cleanup();
    
    return sessionId;
  }

  static getSession(sessionId: string, ipAddress: string, userAgent: string): any {
    const session = this.sessions.get(sessionId);
    
    if (!session) return null;
    
    // Check expiration
    if (Date.now() - session.lastAccess > SECURITY_CONFIG.SESSION.MAX_AGE) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Validate IP and User Agent
    if (session.ipAddress !== ipAddress) {
      this.sessions.delete(sessionId);
      return null;
    }

    if (session.userAgent !== userAgent) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last access
    session.lastAccess = Date.now();
    
    return {
      userId: session.userId,
      data: session.data,
      created: session.created,
    };
  }

  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccess > SECURITY_CONFIG.SESSION.MAX_AGE) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Enhanced Rate limiting function
export function rateLimit(
  key: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; resetTime: number; remaining: number; blocked?: boolean } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + limit.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      resetTime: newEntry.resetTime,
      remaining: limit.requests - 1,
    };
  }

  // Check if blocked from previous violations
  if (entry.blocked && now < entry.resetTime) {
    return {
      allowed: false,
      resetTime: entry.resetTime,
      remaining: 0,
      blocked: true,
    };
  }

  if (entry.count >= limit.requests) {
    // Rate limit exceeded - block for extended period
    entry.blocked = true;
    entry.resetTime = now + (limit.windowMs * 2); // Extended block
    rateLimitStore.set(key, entry);
    
    return {
      allowed: false,
      resetTime: entry.resetTime,
      remaining: 0,
      blocked: true,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    resetTime: entry.resetTime,
    remaining: limit.requests - entry.count,
  };
}

// File Upload Security Class
export class FileUploadSecurity {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
  ];

  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
  ];

  static validateFile(file: { 
    name: string; 
    type: string; 
    size: number; 
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File too large (max ${SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (this.DANGEROUS_EXTENSIONS.includes(extension)) {
      errors.push('Dangerous file extension');
    }

    // Check filename
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('Invalid filename characters');
    }

    // Check for double extensions
    if (/\.[^.]+\.[^.]+$/.test(file.name)) {
      errors.push('Double file extensions not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 100);
  }

  static generateSecureFilename(originalName: string): string {
    const sanitized = this.sanitizeFilename(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
    
    return `${name}_${timestamp}_${random}${extension}`;
  }
}

// Security Logger Class
export class SecurityLogger {
  private static logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'critical';
    event: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
  }> = [];

  static log(
    level: 'info' | 'warn' | 'error' | 'critical',
    event: string,
    details: any = {},
    context: { ipAddress?: string; userAgent?: string } = {}
  ): void {
    const logEntry = {
      timestamp: Date.now(),
      level,
      event,
      details,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    this.logs.push(logEntry);
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY ${level.toUpperCase()}]`, event, details);
    }

    // Keep last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  static getLogs(level?: string, limit: number = 100): any[] {
    let filteredLogs = level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
    
    return filteredLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Security Event Helpers
  static logLoginAttempt(success: boolean, identifier: string, context: any): void {
    this.log(
      success ? 'info' : 'warn',
      success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      { identifier, success },
      context
    );
  }

  static logRateLimitExceeded(identifier: string, context: any): void {
    this.log('warn', 'RATE_LIMIT_EXCEEDED', { identifier }, context);
  }

  static logSuspiciousActivity(activity: string, details: any, context: any): void {
    this.log('error', 'SUSPICIOUS_ACTIVITY', { activity, ...details }, context);
  }

  static logSecurityViolation(violation: string, details: any, context: any): void {
    this.log('critical', 'SECURITY_VIOLATION', { violation, ...details }, context);
  }
}

// Clean up expired rate limit entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const connectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (connectingIP) {
    return connectingIP;
  }
  
  return 'unknown';
}

// Validate origin for CORS
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  return SECURITY_CONFIG.ALLOWED_ORIGINS.some(allowedOrigin => {
    if (allowedOrigin === origin) return true;
    
    // Allow localhost with any port in development
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return true;
    }
    
    return false;
  });
}

// Enhanced input sanitization
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return XSSProtection.sanitizeText(input).substring(0, 1000);
}

// Validate email format (additional to Zod validation)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Enhanced suspicious activity detection
export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const reasons: string[] = [];
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /headless/i,
    /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
    /curl/i, /wget/i, /python/i, /java/i, /ruby/i,
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Bot-like user agent detected');
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious user agent');
  }
  
  // Check for suspicious referer patterns
  const suspiciousRefererPatterns = [
    /\.tk$/, /\.ml$/, /\.ga$/, /\.cf$/, /\.gq$/,
    /bit\.ly/, /tinyurl/, /t\.co/, /goo\.gl/,
  ];
  
  if (referer && suspiciousRefererPatterns.some(pattern => pattern.test(referer))) {
    reasons.push('Suspicious referer domain');
  }
  
  // Check for origin/referer mismatch
  if (origin && referer) {
    try {
      const originHost = new URL(origin).hostname;
      const refererHost = new URL(referer).hostname;
      if (originHost !== refererHost) {
        reasons.push('Origin/Referer host mismatch');
      }
    } catch {
      reasons.push('Invalid origin or referer URL');
    }
  }
  
  // Check for unusual request patterns
  const suspiciousUserAgentPatterns = [
    /^Mozilla\/5\.0$/,  // Too generic
    /libwww-perl/,
    /python-requests/,
    /Go-http-client/,
  ];
  
  if (suspiciousUserAgentPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Suspicious user agent pattern');
  }
  
  // Check for missing accept-language (unusual for browsers)
  if (!acceptLanguage && userAgent.includes('Mozilla')) {
    reasons.push('Missing accept-language header');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (reasons.length >= 3) {
    riskLevel = 'high';
  } else if (reasons.length >= 2) {
    riskLevel = 'medium';
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
    riskLevel,
  };
}

// Enhanced security event logging
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium',
  context?: { ipAddress?: string; userAgent?: string }
): void {
  // Use the SecurityLogger class
  const level = severity === 'high' ? 'critical' : severity === 'medium' ? 'warn' : 'info';
  SecurityLogger.log(level, event, details, context || {});
}

// Create rate limit key
export function createRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

// Validate request size
export function validateRequestSize(contentLength: string | null): boolean {
  if (!contentLength) return true;
  
  const size = parseInt(contentLength, 10);
  return size <= SECURITY_CONFIG.MAX_REQUEST_SIZE;
}

// Hash sensitive data for logging
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

// Main Security Utilities Export
export const Security = {
  // Configuration
  Config: SECURITY_CONFIG,
  
  // Validation Schemas
  Schemas: ValidationSchemas,
  
  // Protection Classes
  XSS: XSSProtection,
  SQLInjection: SQLInjectionProtection,
  CSRF: CSRFProtection,
  Password: PasswordSecurity,
  Session: SessionSecurity,
  FileUpload: FileUploadSecurity,
  Logger: SecurityLogger,
  
  // Utility Functions
  rateLimit,
  validateOrigin,
  sanitizeInput,
  isValidEmail,
  detectSuspiciousActivity,
  logSecurityEvent,
  getClientIP,
  createRateLimitKey,
  validateRequestSize,
  hashForLogging,
  
  // Legacy Functions (for backward compatibility)
  generateCSRFToken,
  verifyCSRFToken,
};

export default Security;