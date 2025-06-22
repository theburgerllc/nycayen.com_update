import { Product, Category, ProductImage, ProductVariantGroup } from '../types';

// Categories
export const categories: Category[] = [
  {
    id: 'hair-care',
    slug: 'hair-care',
    name: 'Hair Care',
    description: 'Professional hair care products for healthy, beautiful hair',
    image: '/images/shop/categories/hair-care.jpg',
    productCount: 15,
    featured: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'styling-tools',
    slug: 'styling-tools',
    name: 'Styling Tools',
    description: 'Professional styling tools and equipment',
    image: '/images/shop/categories/styling-tools.jpg',
    productCount: 8,
    featured: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'wigs-extensions',
    slug: 'wigs-extensions',
    name: 'Wigs & Extensions',
    description: 'Premium wigs and hair extensions',
    image: '/images/shop/categories/wigs-extensions.jpg',
    productCount: 12,
    featured: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'hair-accessories',
    slug: 'hair-accessories',
    name: 'Hair Accessories',
    description: 'Stylish accessories for every occasion',
    image: '/images/shop/categories/accessories.jpg',
    productCount: 20,
    featured: false,
    sortOrder: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Sample product images
const createProductImages = (productName: string, count: number): ProductImage[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `img_${productName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
    url: `/images/shop/products/${productName.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.jpg`,
    alt: `${productName} - Image ${index + 1}`,
    width: 600,
    height: 600,
    isMain: index === 0,
  }));
};

// Product variants
const sizeVariants: ProductVariantGroup = {
  id: 'size',
  name: 'Size',
  type: 'dropdown',
  required: true,
  variants: [
    { id: 'small', name: 'Small', value: 'S', stock: 10, sku: 'SKU-S' },
    { id: 'medium', name: 'Medium', value: 'M', stock: 15, sku: 'SKU-M' },
    { id: 'large', name: 'Large', value: 'L', stock: 8, sku: 'SKU-L' },
  ],
};

const colorVariants: ProductVariantGroup = {
  id: 'color',
  name: 'Color',
  type: 'color',
  required: true,
  variants: [
    { id: 'natural-black', name: 'Natural Black', value: '#1B1B1B', stock: 12, sku: 'SKU-BLK' },
    { id: 'dark-brown', name: 'Dark Brown', value: '#4A3429', stock: 10, sku: 'SKU-DBR' },
    { id: 'chocolate-brown', name: 'Chocolate Brown', value: '#7B4B2A', stock: 8, sku: 'SKU-CBR' },
    { id: 'honey-blonde', name: 'Honey Blonde', value: '#D4B896', stock: 6, sku: 'SKU-HBL' },
    { id: 'platinum-blonde', name: 'Platinum Blonde', value: '#F5F5DC', stock: 4, sku: 'SKU-PBL' },
  ],
};

const lengthVariants: ProductVariantGroup = {
  id: 'length',
  name: 'Length',
  type: 'dropdown',
  required: true,
  variants: [
    { id: '12inch', name: '12 inches', value: '12"', stock: 8, sku: 'SKU-12' },
    { id: '14inch', name: '14 inches', value: '14"', stock: 10, sku: 'SKU-14' },
    { id: '16inch', name: '16 inches', value: '16"', stock: 12, sku: 'SKU-16' },
    { id: '18inch', name: '18 inches', value: '18"', stock: 8, sku: 'SKU-18' },
    { id: '20inch', name: '20 inches', value: '20"', stock: 6, sku: 'SKU-20' },
  ],
};

// Products
export const products: Product[] = [
  // Hair Care Products
  {
    id: 'moisture-repair-shampoo',
    slug: 'moisture-repair-shampoo',
    name: 'Moisture Repair Shampoo',
    description: 'Professional moisture repair shampoo designed to restore and revitalize damaged hair. Infused with argan oil and keratin proteins to strengthen and add shine.',
    shortDescription: 'Professional moisture repair shampoo with argan oil and keratin',
    price: 45.00,
    comparePrice: 60.00,
    sku: 'MRS-001',
    images: createProductImages('Moisture Repair Shampoo', 3),
    variants: [sizeVariants],
    stock: 25,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['hair-care'],
    tags: ['shampoo', 'moisture', 'repair', 'argan oil', 'keratin'],
    brand: 'Nycayen Professional',
    type: 'Hair Care',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15'),
    averageRating: 4.8,
    reviewCount: 24,
    totalSold: 156,
    isOnSale: true,
    discountPercentage: 25,
  },
  {
    id: 'hydrating-conditioner',
    slug: 'hydrating-conditioner',
    name: 'Deep Hydrating Conditioner',
    description: 'Intensive hydrating conditioner that provides deep moisture and nourishment. Perfect for dry, damaged, or chemically treated hair.',
    shortDescription: 'Intensive hydrating conditioner for dry and damaged hair',
    price: 48.00,
    comparePrice: 55.00,
    sku: 'DHC-001',
    images: createProductImages('Deep Hydrating Conditioner', 3),
    variants: [sizeVariants],
    stock: 30,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['hair-care'],
    tags: ['conditioner', 'hydrating', 'moisture', 'dry hair'],
    brand: 'Nycayen Professional',
    type: 'Hair Care',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    publishedAt: new Date('2024-01-16'),
    averageRating: 4.7,
    reviewCount: 18,
    totalSold: 134,
    isOnSale: true,
    discountPercentage: 13,
  },
  {
    id: 'curl-defining-cream',
    slug: 'curl-defining-cream',
    name: 'Curl Defining Cream',
    description: 'Lightweight curl defining cream that enhances natural curls while reducing frizz. Provides long-lasting hold without stiffness.',
    shortDescription: 'Lightweight cream for defining and enhancing natural curls',
    price: 35.00,
    sku: 'CDC-001',
    images: createProductImages('Curl Defining Cream', 4),
    stock: 20,
    trackQuantity: true,
    allowBackorder: true,
    categories: ['hair-care'],
    tags: ['curl cream', 'curly hair', 'anti-frizz', 'styling'],
    brand: 'Nycayen Professional',
    type: 'Hair Care',
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    publishedAt: new Date('2024-01-17'),
    averageRating: 4.6,
    reviewCount: 32,
    totalSold: 89,
  },
  {
    id: 'heat-protectant-spray',
    slug: 'heat-protectant-spray',
    name: 'Thermal Heat Protectant Spray',
    description: 'Professional heat protectant spray that shields hair from heat damage up to 450°F. Contains UV filters and nourishing oils.',
    shortDescription: 'Professional heat protection up to 450°F with UV filters',
    price: 28.00,
    sku: 'HPS-001',
    images: createProductImages('Heat Protectant Spray', 2),
    stock: 40,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['hair-care'],
    tags: ['heat protectant', 'thermal protection', 'UV protection', 'styling'],
    brand: 'Nycayen Professional',
    type: 'Hair Care',
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    publishedAt: new Date('2024-01-18'),
    averageRating: 4.9,
    reviewCount: 41,
    totalSold: 203,
  },

  // Styling Tools
  {
    id: 'professional-hair-dryer',
    slug: 'professional-hair-dryer',
    name: 'Professional Ionic Hair Dryer',
    description: 'Salon-quality ionic hair dryer with multiple heat and speed settings. Features tourmaline technology for faster drying and reduced frizz.',
    shortDescription: 'Salon-quality ionic dryer with tourmaline technology',
    price: 189.00,
    comparePrice: 249.00,
    sku: 'PHD-001',
    images: createProductImages('Professional Hair Dryer', 5),
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        required: true,
        variants: [
          { id: 'black', name: 'Black', value: '#000000', stock: 8, sku: 'PHD-BLK' },
          { id: 'white', name: 'White', value: '#FFFFFF', stock: 6, sku: 'PHD-WHT' },
          { id: 'rose-gold', name: 'Rose Gold', value: '#E8B4B8', stock: 4, sku: 'PHD-RG' },
        ],
      },
    ],
    stock: 18,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['styling-tools'],
    tags: ['hair dryer', 'ionic', 'professional', 'tourmaline'],
    brand: 'Nycayen Professional',
    type: 'Styling Tools',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2024-01-20'),
    averageRating: 4.8,
    reviewCount: 15,
    totalSold: 47,
    isOnSale: true,
    discountPercentage: 24,
  },
  {
    id: 'ceramic-flat-iron',
    slug: 'ceramic-flat-iron',
    name: 'Ceramic Titanium Flat Iron',
    description: 'Professional-grade ceramic titanium flat iron with adjustable temperature control. Heats up quickly and maintains consistent temperature.',
    shortDescription: 'Professional ceramic titanium flat iron with temp control',
    price: 125.00,
    comparePrice: 160.00,
    sku: 'CFI-001',
    images: createProductImages('Ceramic Flat Iron', 4),
    stock: 12,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['styling-tools'],
    tags: ['flat iron', 'ceramic', 'titanium', 'straightener'],
    brand: 'Nycayen Professional',
    type: 'Styling Tools',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    publishedAt: new Date('2024-01-21'),
    averageRating: 4.7,
    reviewCount: 22,
    totalSold: 63,
    isOnSale: true,
    discountPercentage: 22,
  },

  // Wigs & Extensions
  {
    id: 'luxury-lace-front-wig',
    slug: 'luxury-lace-front-wig',
    name: 'Luxury Lace Front Wig',
    description: 'Premium human hair lace front wig with natural hairline. Hand-tied for maximum comfort and realistic appearance.',
    shortDescription: 'Premium human hair lace front wig with natural hairline',
    price: 485.00,
    comparePrice: 650.00,
    sku: 'LLW-001',
    images: createProductImages('Luxury Lace Front Wig', 6),
    variants: [colorVariants, lengthVariants],
    stock: 8,
    trackQuantity: true,
    allowBackorder: true,
    categories: ['wigs-extensions'],
    tags: ['wig', 'lace front', 'human hair', 'luxury'],
    brand: 'Nycayen Signature',
    type: 'Wigs',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    publishedAt: new Date('2024-01-25'),
    averageRating: 4.9,
    reviewCount: 12,
    totalSold: 28,
    isOnSale: true,
    discountPercentage: 25,
  },
  {
    id: 'clip-in-extensions',
    slug: 'clip-in-extensions',
    name: 'Remy Human Hair Clip-In Extensions',
    description: 'Premium Remy human hair clip-in extensions. Easy to apply and remove, perfect for adding length and volume.',
    shortDescription: 'Premium Remy human hair clip-in extensions',
    price: 185.00,
    sku: 'CIE-001',
    images: createProductImages('Clip In Extensions', 4),
    variants: [colorVariants, lengthVariants],
    stock: 15,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['wigs-extensions'],
    tags: ['extensions', 'clip-in', 'remy hair', 'human hair'],
    brand: 'Nycayen Signature',
    type: 'Extensions',
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
    publishedAt: new Date('2024-01-26'),
    averageRating: 4.6,
    reviewCount: 35,
    totalSold: 87,
  },

  // Hair Accessories
  {
    id: 'silk-hair-scrunchies',
    slug: 'silk-hair-scrunchies',
    name: 'Mulberry Silk Hair Scrunchies Set',
    description: '100% mulberry silk scrunchies that are gentle on hair and prevent breakage. Set of 6 in assorted colors.',
    shortDescription: '100% mulberry silk scrunchies set - gentle on hair',
    price: 32.00,
    sku: 'SHS-001',
    images: createProductImages('Silk Hair Scrunchies', 3),
    stock: 50,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['hair-accessories'],
    tags: ['scrunchies', 'silk', 'hair accessories', 'gentle'],
    brand: 'Nycayen Accessories',
    type: 'Accessories',
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
    publishedAt: new Date('2024-01-28'),
    averageRating: 4.5,
    reviewCount: 67,
    totalSold: 142,
  },
  {
    id: 'luxury-hair-brush',
    slug: 'luxury-hair-brush',
    name: 'Luxury Paddle Hair Brush',
    description: 'Professional paddle brush with natural boar bristles and nylon pins. Perfect for detangling and adding shine.',
    shortDescription: 'Professional paddle brush with boar bristles',
    price: 78.00,
    comparePrice: 95.00,
    sku: 'LHB-001',
    images: createProductImages('Luxury Hair Brush', 3),
    stock: 25,
    trackQuantity: true,
    allowBackorder: false,
    categories: ['hair-accessories'],
    tags: ['brush', 'paddle brush', 'boar bristles', 'professional'],
    brand: 'Nycayen Professional',
    type: 'Tools',
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-29'),
    updatedAt: new Date('2024-01-29'),
    publishedAt: new Date('2024-01-29'),
    averageRating: 4.7,
    reviewCount: 29,
    totalSold: 73,
    isOnSale: true,
    discountPercentage: 18,
  },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(product => product.categories.includes(categorySlug));
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}

export function getOnSaleProducts(): Product[] {
  return products.filter(product => product.isOnSale);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    product.brand?.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug);
}