import winston from 'winston';

// Security event types
export enum SecurityEventType {
  // Authentication events
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',

  // Authorization events
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  ADMIN_ACCESS = 'ADMIN_ACCESS',

  // Input validation events
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',

  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // API security events
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',

  // System security events
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  SECRET_ACCESS = 'SECRET_ACCESS',

  // Network security events
  SSL_ERROR = 'SSL_ERROR',
  CERTIFICATE_ERROR = 'CERTIFICATE_ERROR',

  // Custom events
  SECURITY_ALERT = 'SECURITY_ALERT',
  AUDIT_EVENT = 'AUDIT_EVENT'
}

// Security event severity levels
export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Security event interface
export interface SecurityEventData {
  type: SecurityEventType;
  severity: SecuritySeverity;
  message: string;
  service: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Winston logger configuration for security events
const securityLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-logger' },
  transports: [
    // Security events to dedicated file
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // High severity events to separate file
    new winston.transports.File({
      filename: 'logs/security-critical.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    }),

    // Console output in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Security logger class
export class SecurityLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Log security event
  log(event: Omit<SecurityEventData, 'service' | 'timestamp'>): void {
    const fullEvent: SecurityEventData = {
      ...event,
      service: this.serviceName,
      timestamp: new Date()
    };

    const logLevel = this.getLogLevel(event.severity);

    securityLogger.log(logLevel, {
      ...fullEvent,
      // Flatten metadata for better searchability
      ...event.metadata
    });
  }

  // Convenience methods for common security events
  logAuthSuccess(userId: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.AUTH_SUCCESS,
      severity: SecuritySeverity.LOW,
      message: `User ${userId} authenticated successfully`,
      userId,
      metadata
    });
  }

  logAuthFailure(identifier: string, reason: string, ipAddress?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.AUTH_FAILURE,
      severity: SecuritySeverity.MEDIUM,
      message: `Authentication failed for ${identifier}: ${reason}`,
      ipAddress,
      metadata: { reason, ...metadata }
    });
  }

  logAccessDenied(userId: string | undefined, resource: string, ipAddress?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.ACCESS_DENIED,
      severity: SecuritySeverity.MEDIUM,
      message: `Access denied to ${resource} for user ${userId || 'unauthenticated'}`,
      userId,
      ipAddress,
      metadata
    });
  }

  logRateLimitExceeded(identifier: string, endpoint: string, ipAddress?: string): void {
    this.log({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.MEDIUM,
      message: `Rate limit exceeded for ${identifier} on ${endpoint}`,
      ipAddress,
      endpoint,
      metadata: { identifier }
    });
  }

  logValidationFailure(endpoint: string, errors: any[], ipAddress?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.VALIDATION_FAILED,
      severity: SecuritySeverity.LOW,
      message: `Validation failed on ${endpoint}: ${errors.length} errors`,
      ipAddress,
      endpoint,
      metadata: { errors, ...metadata }
    });
  }

  logSuspiciousActivity(activity: string, severity: SecuritySeverity = SecuritySeverity.MEDIUM, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.SECURITY_ALERT,
      severity,
      message: `Suspicious activity detected: ${activity}`,
      metadata
    });
  }

  logSSLError(error: string, ipAddress?: string, metadata?: Record<string, any>): void {
    this.log({
      type: SecurityEventType.SSL_ERROR,
      severity: SecuritySeverity.HIGH,
      message: `SSL/TLS error: ${error}`,
      ipAddress,
      metadata
    });
  }

  // Create Express middleware for automatic logging
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      // Log request
      this.log({
        type: SecurityEventType.AUDIT_EVENT,
        severity: SecuritySeverity.LOW,
        message: `API request: ${req.method} ${req.path}`,
        userId: req.userId || req.auth?.userId,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method,
        metadata: {
          query: req.query,
          body: req.method !== 'GET' ? '[REDACTED]' : undefined,
          headers: this.sanitizeHeaders(req.headers)
        }
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - startTime;

        // Log security-relevant responses
        if (res.statusCode >= 400) {
          this.log({
            type: SecurityEventType.AUDIT_EVENT,
            severity: res.statusCode >= 500 ? SecuritySeverity.MEDIUM : SecuritySeverity.LOW,
            message: `API response: ${res.statusCode} for ${req.method} ${req.path}`,
            userId: req.userId || req.auth?.userId,
            ipAddress: req.ip || req.connection?.remoteAddress,
            endpoint: req.path,
            method: req.method,
            metadata: {
              statusCode: res.statusCode,
              duration,
              error: res.statusCode >= 500 ? 'Server error' : undefined
            }
          });
        }
      });

      next();
    };
  }

  private getLogLevel(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return 'error';
      case SecuritySeverity.HIGH:
        return 'warn';
      case SecuritySeverity.MEDIUM:
        return 'info';
      case SecuritySeverity.LOW:
        return 'debug';
      default:
        return 'info';
    }
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

// Factory function to create service-specific logger
export function createSecurityLogger(serviceName: string): SecurityLogger {
  return new SecurityLogger(serviceName);
}

// Global security logger instance
export const globalSecurityLogger = new SecurityLogger('global');
