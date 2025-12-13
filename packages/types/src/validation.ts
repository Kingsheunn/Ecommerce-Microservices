import { z } from 'zod';
// Import explicit .js file in source so emitted ESM has explicit extensions
import { colors, sizes, ProductFormSchema } from './product.js';

// API validation schemas (aligned with Prisma types)
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().int().positive('Price must be positive integer'), // Prisma uses Int
  sizes: z.array(z.enum(sizes)).min(1, 'At least one size is required'),
  colors: z.array(z.enum(colors)).min(1, 'At least one color is required'),
  images: z.record(z.string(), z.string()), // Record<string, string> for JSON field
  categorySlug: z.string().min(1, 'Category is required'),
}).refine(
  (data) => {
    const missingImages = data.colors.filter(
      (color) => !data.images?.[color]
    );
    return missingImages.length === 0;
  },
  {
    message: "Image is required for each selected color!",
    path: ["images"],
  }
);

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long').optional(),
  shortDescription: z.string().min(1, 'Short description is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().int().positive('Price must be positive integer').optional(),
  sizes: z.array(z.enum(sizes)).min(1, 'At least one size is required').optional(),
  colors: z.array(z.enum(colors)).min(1, 'At least one color is required').optional(),
  images: z.record(z.string(), z.string()).optional(),
  categorySlug: z.string().min(1, 'Category is required').optional(),
}).refine(
  (data) => {
    // Only validate images if colors are being updated
    if (!data.colors || !data.images) return true;
    const missingImages = data.colors.filter(
      (color) => !data.images?.[color]
    );
    return missingImages.length === 0;
  },
  {
    message: "Image is required for each selected color!",
    path: ["images"],
  }
);

// Query parameter validation schemas
export const paginationSchema = z.object({
  limit: z.union([z.string(), z.undefined()]).optional().transform((val) => {
    if (!val) return 10;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) return 10;
    return num;
  }),
  sort: z.enum(['asc', 'desc', 'oldest']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  popular: z.union([z.string(), z.undefined()]).optional().transform((val) => {
    return val === 'true' || val === '1';
  }),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
  slug: z.string().min(1, 'Category slug is required').max(255, 'Category slug too long'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long').optional(),
  slug: z.string().min(1, 'Category slug is required').max(255, 'Category slug too long').optional(),
});

// Order validation schemas
export const orderChartSchema = z.object({
  limit: z.string().optional().transform((val) => {
    if (!val) return 10;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) return 10;
    return num;
  }),
});

// Extended Request interface
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      validatedQuery?: any;
    }
  }
}

// Validation middleware helper
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Query validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

// Session management utilities
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (24 hours)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours

  // Idle timeout in milliseconds (2 hours)
  IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours

  // Warning time before session expires (5 minutes)
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes
};

// Session validation middleware
export function validateSession() {
  return (req: any, res: any, next: any) => {
    try {
      const auth = req.auth || {};
      const sessionClaims = auth.sessionClaims;

      if (!sessionClaims) {
        return next(); // Let Clerk handle unauthenticated requests
      }

      const now = Date.now();
      const issuedAt = sessionClaims.iat * 1000; // Convert to milliseconds
      const expiresAt = sessionClaims.exp * 1000; // Convert to milliseconds

      // Check if session has expired
      if (now > expiresAt) {
        return res.status(401).json({
          error: 'Session expired',
          message: 'Your session has expired. Please sign in again.',
          code: 'SESSION_EXPIRED'
        });
      }

      // Check if session is about to expire (warning)
      const timeUntilExpiry = expiresAt - now;
      if (timeUntilExpiry < SESSION_CONFIG.WARNING_TIME) {
        res.setHeader('X-Session-Warning', 'true');
        res.setHeader('X-Session-Expires-In', Math.floor(timeUntilExpiry / 1000));
      }

      // Add session metadata to request
      req.sessionInfo = {
        issuedAt,
        expiresAt,
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000),
        isExpiringSoon: timeUntilExpiry < SESSION_CONFIG.WARNING_TIME
      };

      next();
    } catch (error) {
      console.error('Session validation error:', error);
      next();
    }
  };
}
