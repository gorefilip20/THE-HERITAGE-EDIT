import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  basePriceCents: z.number().int().positive(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  description: z.string().optional(),
  currency: z.string().length(3).default("NGN"),
  publishImmediately: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        color: z.string().nullable().optional(),
        colorHex: z.string().nullable().optional(),
        stockCount: z.number().int().min(0).default(0),
        priceDeltaCents: z.number().int().default(0),
      }),
    )
    .optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2),
  phone: z.string().max(20).optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: shippingAddressSchema,
  shippingOptionId: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
