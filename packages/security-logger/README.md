# Security Logger

A centralized security logging system for the microservices e-commerce application. This package provides comprehensive security event logging, audit trails, and monitoring capabilities.

## Features

- **Comprehensive Event Types**: Authentication, authorization, validation, rate limiting, and system events
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL with appropriate logging levels
- **Structured Logging**: JSON format with Winston for easy parsing and analysis
- **Sensitive Data Sanitization**: Automatic redaction of sensitive headers and data
- **Middleware Integration**: Express middleware for automatic request/response logging
- **Multi-transport Logging**: File-based logging with rotation and console output

## Installation

```bash
cd packages/security-logger
pnpm install
```

## Usage

### Basic Usage

```typescript
import { createSecurityLogger, SecurityEventType, SecuritySeverity } from '@repo/security-logger';

// Create service-specific logger
const logger = createSecurityLogger('product-service');

// Log authentication events
logger.logAuthSuccess('user123');
logger.logAuthFailure('user@example.com', 'Invalid password', '192.168.1.1');

// Log access control events
logger.logAccessDenied('user123', '/api/admin/products');

// Log validation failures
logger.logValidationFailure('/api/products', validationErrors, '192.168.1.1');

// Log custom security events
logger.log({
  type: SecurityEventType.SECURITY_ALERT,
  severity: SecuritySeverity.HIGH,
  message: 'Suspicious activity detected',
  metadata: { suspiciousPattern: 'unusual_login_attempts' }
});
```

### Express Middleware Integration

```typescript
import express from 'express';
import { createSecurityLogger } from '@repo/security-logger';

const app = express();
const securityLogger = createSecurityLogger('my-service');

// Add security logging middleware (logs all requests/responses)
app.use(securityLogger.createMiddleware());

// Your routes here...
```

### Event Types

| Event Type | Description | Severity |
|------------|-------------|----------|
| `AUTH_SUCCESS` | Successful authentication | LOW |
| `AUTH_FAILURE` | Failed authentication attempt | MEDIUM |
| `ACCESS_DENIED` | Authorization failure | MEDIUM |
| `RATE_LIMIT_EXCEEDED` | Rate limit violation | MEDIUM |
| `VALIDATION_FAILED` | Input validation failure | LOW |
| `SQL_INJECTION_ATTEMPT` | SQL injection detected | CRITICAL |
| `XSS_ATTEMPT` | XSS attack detected | HIGH |
| `SSL_ERROR` | SSL/TLS connection error | HIGH |
| `SECURITY_ALERT` | General security alert | MEDIUM |
| `AUDIT_EVENT` | General audit event | LOW |

## Log Files

The logger creates two types of log files:

1. **`logs/security.log`** - All security events (5MB max, 5 files)
2. **`logs/security-critical.log`** - High severity events only (5MB max, 3 files)

### Log Format

```json
{
  "timestamp": "2025-12-02T23:35:00.000Z",
  "level": "info",
  "type": "AUTH_SUCCESS",
  "severity": "LOW",
  "message": "User user123 authenticated successfully",
  "service": "product-service",
  "userId": "user123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "endpoint": "/api/login",
  "method": "POST"
}
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Logging level (default: 'info')
- `NODE_ENV`: Environment mode (affects console logging)

### Custom Transports

Add custom Winston transports for external logging services:

```typescript
import { addTransport } from 'winston';

// Add external logging service
addTransport(new winston.transports.Http({
  host: 'log-collector.example.com',
  path: '/logs/security'
}));
```

## Security Considerations

### Data Sanitization

The logger automatically sanitizes:
- Authorization headers
- Cookies
- API keys
- Sensitive request bodies

### Log Security

- Logs are written with appropriate file permissions (600)
- Sensitive data is redacted before logging
- Log files should be monitored for unauthorized access
- Consider log encryption for production environments

## Monitoring & Analysis

### Log Analysis Tools

```bash
# Search for failed authentication attempts
grep "AUTH_FAILURE" logs/security.log

# Count events by type
jq -r '.type' logs/security.log | sort | uniq -c

# Find high-severity events
jq 'select(.severity == "HIGH" or .severity == "CRITICAL")' logs/security.log
```

### Integration with Monitoring Systems

The structured JSON format makes it easy to integrate with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- Custom monitoring dashboards

## Production Deployment

### Log Rotation

Configure log rotation based on your infrastructure:

```bash
# Using logrotate
/var/log/microservices/security*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 root root
}
```

### Log Shipping

Ship logs to centralized logging infrastructure:

```bash
# Using rsyslog or filebeat
# Forward security logs to central logging server
```

### Performance Considerations

- Logging is asynchronous and non-blocking
- File I/O is buffered for performance
- Consider log aggregation for high-traffic services

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check file permissions and directory existence
2. **High disk usage**: Adjust maxsize and maxFiles settings
3. **Performance impact**: Monitor logging overhead in high-traffic scenarios

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

## API Reference

### SecurityLogger Class

#### Methods

- `log(event)` - Log custom security event
- `logAuthSuccess(userId, metadata?)` - Log successful authentication
- `logAuthFailure(identifier, reason, ipAddress?, metadata?)` - Log failed authentication
- `logAccessDenied(userId, resource, ipAddress?, metadata?)` - Log access denial
- `logRateLimitExceeded(identifier, endpoint, ipAddress?)` - Log rate limit violation
- `logValidationFailure(endpoint, errors, ipAddress?, metadata?)` - Log validation failure
- `logSuspiciousActivity(activity, severity?, metadata?)` - Log suspicious activity
- `logSSLError(error, ipAddress?, metadata?)` - Log SSL/TLS error
- `createMiddleware()` - Create Express middleware for automatic logging

### Types

- `SecurityEventType` - Enumeration of event types
- `SecuritySeverity` - Enumeration of severity levels
- `SecurityEventData` - Event data interface

## Contributing

When adding new security events:

1. Add new event type to `SecurityEventType` enum
2. Choose appropriate severity level
3. Document the event in this README
4. Add convenience method if commonly used
5. Update monitoring/alerting rules if necessary
