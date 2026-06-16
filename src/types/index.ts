export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string | null;
  colorHex: string | null;
  stockCount: number;
  priceDeltaCents: number;
}

export interface HeritageNarrative {
  id: string;
  historyAndHeritage: string;
  whenToWear: string;
  rightOccasion: string[];
  styleRecommendations: string[];
  aiModelUsed: string;
  generatedAt: string;
  approvedAt: string | null;
  isApproved: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  basePriceCents: number;
  salePriceCents: number | null;
  currency: string;
  status: "DRAFT" | "AI_PENDING" | "AI_REVIEW" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  heritage: HeritageNarrative | null;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  size: string;
  color: string | null;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  subtotalCents: number;
  itemCount: number;
}

export interface ShippingOption {
  id: string;
  carrier: string;
  service: string;
  estimatedDays: number;
  priceCents: number;
  currency: string;
}

export interface TaxDutyEstimate {
  taxCents: number;
  dutyCents: number;
  currency: string;
  country: string;
}

export interface CheckoutSession {
  cartId: string;
  email: string;
  shippingAddress: ShippingAddress;
  shippingOption: ShippingOption | null;
  taxDuty: TaxDutyEstimate | null;
  paymentIntentId: string | null;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface AdminMetrics {
  totalRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  conversionRate: number;
  stockOutAlerts: number;
  pendingAiReview: number;
  topProducts: Array<{ name: string; revenue: number; units: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  brand?: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  collection?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface HeritageAIResponse {
  history_and_heritage: string;
  when_to_wear: string;
  right_occasion: string[];
  style_recommendations: string[];
}
