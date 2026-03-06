import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  unitPrice: z.number().min(0, 'Price must be 0 or greater'),
  supplier: z.string().min(2, 'Supplier name is required'),
  manufacturer: z.string().min(2, 'Manufacturer name is required'),
  warranty: z.string().min(1, 'Warranty information is required'),
  lowStockThreshold: z.number().min(1, 'Threshold must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  specifications: z.record(z.string()).optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  notes: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean(),
});