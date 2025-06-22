import { z } from 'zod';

// Product types
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  isMain?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number; // Additional cost for this variant
  stock: number;
  sku: string;
  image?: string;
}

export interface ProductVariantGroup {
  id: string;
  name: string; // e.g., "Size", "Color"
  type: 'color' | 'size' | 'text' | 'dropdown';
  required: boolean;
  variants: ProductVariant[];
}

export interface ProductReview {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number; // Original price for discount display
  cost?: number; // Cost price for margin calculation
  sku: string;
  barcode?: string;
  weight?: number; // in grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  variants?: ProductVariantGroup[];
  stock: number;
  lowStockThreshold?: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  categories: string[];
  tags: string[];
  brand?: string;
  vendor?: string;
  type: string; // Product type (e.g., "Hair Care", "Styling Tools")
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  // Calculated fields
  averageRating?: number;
  reviewCount?: number;
  totalSold?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
}

// Category types
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  featured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart types
export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Price at time of adding to cart
  selectedVariants?: { [groupId: string]: string }; // variant group ID -> variant ID
  addedAt: Date;
  // Calculated fields
  totalPrice: number;
}

export interface Cart {
  id: string;
  customerId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  selectedVariants?: { [groupId: string]: string };
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  customerId?: string;
  sessionId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  productTitle: string;
  variantTitle?: string;
  sku: string;
  weight?: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  email: string;
  phone?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered';
  status: 'open' | 'closed' | 'cancelled';
  paymentMethod?: string;
  paymentReference?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  closedAt?: Date;
}

// Filter and search types
export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  tags?: string[];
  priceRange?: PriceRange;
  inStock?: boolean;
  onSale?: boolean;
  rating?: number; // Minimum rating
  sortBy?: 'name' | 'price' | 'created' | 'updated' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'tag';
  id: string;
  title: string;
  image?: string;
  url: string;
}

// Shopping context types
export interface ShopContextType {
  // Cart
  cart: Cart | null;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number, variants?: { [key: string]: string }) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  
  // Wishlist
  wishlist: Wishlist | null;
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (productId: string, variants?: { [key: string]: string }) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string, variants?: { [key: string]: string }) => boolean;
  
  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
  showQuickAdd?: boolean;
  showCompare?: boolean;
  className?: string;
}

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  pagination?: {
    page: number;
    totalPages: number;
    totalProducts: number;
    onPageChange: (page: number) => void;
  };
}

// API response types
export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filters: {
    categories: { id: string; name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: PriceRange;
    tags: { name: string; count: number }[];
  };
}

export interface ProductResponse {
  product: Product;
  relatedProducts: Product[];
  reviews: ProductReview[];
  reviewStats: {
    average: number;
    total: number;
    distribution: { [rating: number]: number };
  };
}

// Form validation schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  variants: z.record(z.string()).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
});

export const checkoutSchema = z.object({
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zipCode: z.string().min(1, 'ZIP code required'),
    country: z.string().min(1, 'Country required'),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zipCode: z.string().min(1, 'ZIP code required'),
    country: z.string().min(1, 'Country required'),
    phone: z.string().optional(),
  }).optional(),
  sameAsShipping: z.boolean().default(true),
  shippingMethod: z.string().min(1, 'Shipping method required'),
  paymentMethod: z.string().min(1, 'Payment method required'),
});

export type AddToCartData = z.infer<typeof addToCartSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;

// Analytics event types
export interface ShopAnalyticsEvent {
  event: string;
  productId?: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number;
  quantity?: number;
  cartTotal?: number;
  searchTerm?: string;
  filterType?: string;
  filterValue?: string;
  couponCode?: string;
  orderId?: string;
  revenue?: number;
  customProperties?: { [key: string]: any };
}