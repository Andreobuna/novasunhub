import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const productSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  sku: z.string().min(2),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  currency: z.string().default("NGN"),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().optional(),
  warranty: z.string().optional(),
  weightKg: z.number().optional().nullable(),
  dimensions: z.string().optional(),
  voltage: z.string().optional(),
  wattage: z.string().optional(),
  batteryCapacity: z.string().optional(),
  inverterCapacity: z.string().optional(),
  compatibility: z.string().optional(),
  installationInfo: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(productImageSchema).optional().default([]),
  specifications: z.array(productSpecSchema).optional().default([]),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().optional(),
  country: z.string().default("Nigeria"),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z
    .enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]).optional(),
});
