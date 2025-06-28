import { Factory } from 'factory.ts'
import { faker } from '@faker-js/faker'

// User factory
export const UserFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  preferences: {
    newsletter: faker.datatype.boolean(),
    smsNotifications: faker.datatype.boolean(),
    emailNotifications: faker.datatype.boolean(),
  },
}))

// Service factory
export const ServiceFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement([
    'Hair Cut & Style',
    'Hair Color',
    'Custom Wig Design',
    'Bridal Hair Styling',
    'Hair Extensions',
    'Deep Conditioning Treatment',
    'Balayage',
    'Highlights',
    'Perm',
    'Hair Straightening',
  ]),
  category: faker.helpers.arrayElement(['Styling', 'Color', 'Treatment', 'Wigs', 'Bridal']),
  description: faker.lorem.paragraph(),
  duration: faker.helpers.arrayElement([30, 45, 60, 90, 120, 180]),
  price: faker.number.int({ min: 50, max: 500 }),
  available: faker.datatype.boolean({ probability: 0.9 }),
  image: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
  tags: faker.helpers.arrayElements(['popular', 'new', 'trending', 'premium'], { min: 0, max: 2 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}))

// Booking factory
export const BookingFactory = Factory.define(() => {
  const appointmentDate = faker.date.future()
  const service = ServiceFactory.build()
  
  return {
    id: faker.string.uuid(),
    bookingNumber: `BK-${faker.string.numeric(6)}`,
    userId: faker.string.uuid(),
    serviceId: service.id,
    serviceName: service.name,
    serviceCategory: service.category,
    appointmentDate: appointmentDate.toISOString(),
    duration: service.duration,
    price: service.price,
    status: faker.helpers.arrayElement(['pending', 'confirmed', 'completed', 'cancelled']),
    paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'refunded']),
    notes: faker.lorem.sentence(),
    addOns: faker.helpers.arrayElements([
      { name: 'Hair Wash', price: 25 },
      { name: 'Blow Dry', price: 35 },
      { name: 'Deep Conditioning', price: 45 },
    ], { min: 0, max: 2 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
})

// Product factory
export const ProductFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  name: faker.helpers.arrayElement([
    'Premium Shampoo',
    'Hydrating Conditioner',
    'Hair Serum',
    'Styling Cream',
    'Heat Protectant',
    'Hair Oil',
    'Dry Shampoo',
    'Hair Mask',
    'Curl Enhancer',
    'Volume Mousse',
  ]),
  brand: faker.helpers.arrayElement(['Olaplex', 'Redken', 'Matrix', 'Paul Mitchell', 'Kerastase']),
  category: faker.helpers.arrayElement(['Shampoo', 'Conditioner', 'Styling', 'Treatment', 'Tools']),
  description: faker.lorem.paragraph(),
  price: faker.number.float({ min: 15.99, max: 89.99, precision: 0.01 }),
  compareAtPrice: function() {
    return faker.datatype.boolean({ probability: 0.3 }) ? this.price * 1.2 : null
  },
  inStock: faker.datatype.boolean({ probability: 0.9 }),
  inventory: faker.number.int({ min: 0, max: 100 }),
  images: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, (_, i) => `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000) + i}`),
  tags: faker.helpers.arrayElements(['bestseller', 'new', 'organic', 'sulfate-free', 'cruelty-free'], { min: 0, max: 3 }),
  weight: faker.number.float({ min: 0.1, max: 2.0, precision: 0.1 }),
  dimensions: {
    length: faker.number.float({ min: 5, max: 25, precision: 0.1 }),
    width: faker.number.float({ min: 5, max: 15, precision: 0.1 }),
    height: faker.number.float({ min: 10, max: 30, precision: 0.1 }),
  },
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}))

// Order factory
export const OrderFactory = Factory.define(() => {
  const products = ProductFactory.buildList(faker.number.int({ min: 1, max: 4 }))
  const items = products.map(product => ({
    productId: product.id,
    productName: product.name,
    quantity: faker.number.int({ min: 1, max: 3 }),
    price: product.price,
    totalPrice: product.price * faker.number.int({ min: 1, max: 3 }),
  }))
  
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = subtotal * 0.08875 // NYC tax rate
  const shipping = subtotal > 75 ? 0 : 10
  const total = subtotal + tax + shipping
  
  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.numeric(8)}`,
    userId: faker.string.uuid(),
    items,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency: 'USD',
    status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'refunded', 'failed']),
    paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'apple_pay']),
    shippingAddress: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address1: faker.location.streetAddress(),
      address2: faker.datatype.boolean({ probability: 0.3 }) ? faker.location.secondaryAddress() : '',
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US',
    },
    trackingNumber: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.alphanumeric(12).toUpperCase() : null,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
})

// Blog post factory
export const BlogPostFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  slug: faker.lorem.slug(),
  title: faker.lorem.sentence({ min: 4, max: 8 }),
  excerpt: faker.lorem.paragraph(),
  content: faker.lorem.paragraphs(5, '\n\n'),
  category: faker.helpers.arrayElement(['Hair Care', 'Styling Tips', 'Trends', 'Tutorials', 'Product Reviews']),
  tags: faker.helpers.arrayElements(['tips', 'tutorial', 'trends', 'care', 'styling', 'color', 'health'], { min: 1, max: 4 }),
  author: 'Nycayen Moore',
  featuredImage: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
  publishedAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
  featured: faker.datatype.boolean({ probability: 0.2 }),
  readingTime: faker.number.int({ min: 2, max: 15 }),
  seo: {
    metaTitle: faker.lorem.sentence({ min: 4, max: 8 }),
    metaDescription: faker.lorem.sentence({ min: 10, max: 20 }),
    keywords: faker.helpers.arrayElements(['hair', 'beauty', 'styling', 'care', 'tips'], { min: 2, max: 5 }),
  },
}))

// Review factory
export const ReviewFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  serviceId: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  rating: faker.number.int({ min: 1, max: 5 }),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  content: faker.lorem.paragraph(),
  verified: faker.datatype.boolean({ probability: 0.8 }),
  helpful: faker.number.int({ min: 0, max: 25 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}))

// Analytics event factory
export const AnalyticsEventFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  event: faker.helpers.arrayElement([
    'page_view',
    'booking_initiated',
    'booking_completed',
    'add_to_cart',
    'purchase',
    'newsletter_signup',
    'contact_form_submit',
  ]),
  properties: {
    page: faker.internet.url(),
    timestamp: Date.now(),
    userId: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.uuid() : null,
    sessionId: faker.string.uuid(),
    source: faker.helpers.arrayElement(['organic', 'direct', 'social', 'referral', 'email']),
    device: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
    browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge']),
  },
  createdAt: faker.date.recent().toISOString(),
}))

// Notification factory
export const NotificationFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['booking_confirmation', 'payment_received', 'appointment_reminder', 'newsletter']),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  message: faker.lorem.paragraph(),
  read: faker.datatype.boolean({ probability: 0.6 }),
  channel: faker.helpers.arrayElement(['email', 'sms', 'push', 'in_app']),
  scheduledFor: faker.date.future().toISOString(),
  sentAt: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent().toISOString() : null,
  createdAt: faker.date.past().toISOString(),
}))

// Test data builders for specific scenarios
export class TestDataBuilder {
  static createBookingFlow() {
    const user = UserFactory.build()
    const service = ServiceFactory.build()
    const booking = BookingFactory.build({
      userId: user.id,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      price: service.price,
      duration: service.duration,
    })
    
    return { user, service, booking }
  }
  
  static createPurchaseFlow() {
    const user = UserFactory.build()
    const products = ProductFactory.buildList(2)
    const order = OrderFactory.build({
      userId: user.id,
      items: products.map(product => ({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        totalPrice: product.price,
      })),
    })
    
    return { user, products, order }
  }
  
  static createBlogContent() {
    const posts = BlogPostFactory.buildList(5)
    const categories = [...new Set(posts.map(post => post.category))]
    const tags = [...new Set(posts.flatMap(post => post.tags))]
    
    return { posts, categories, tags }
  }
  
  static createReviewsForService(serviceId: string, count = 5) {
    return ReviewFactory.buildList(count, { serviceId })
  }
  
  static createAnalyticsData(days = 30) {
    const events = []
    const now = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      const dayEvents = AnalyticsEventFactory.buildList(
        faker.number.int({ min: 10, max: 100 }),
        {
          createdAt: date.toISOString(),
        }
      )
      
      events.push(...dayEvents)
    }
    
    return events
  }
  
  static createCompleteUserJourney() {
    const user = UserFactory.build()
    
    // User visits site
    const pageView = AnalyticsEventFactory.build({
      event: 'page_view',
      properties: {
        page: '/',
        userId: user.id,
      },
    })
    
    // User books service
    const { service, booking } = this.createBookingFlow()
    booking.userId = user.id
    
    // User writes review
    const review = ReviewFactory.build({
      userId: user.id,
      serviceId: service.id,
      bookingId: booking.id,
    })
    
    // User makes purchase
    const { products, order } = this.createPurchaseFlow()
    order.userId = user.id
    
    return {
      user,
      pageView,
      service,
      booking,
      review,
      products,
      order,
    }
  }
}

// Seed data for consistent testing
export const SeedData = {
  users: UserFactory.buildList(10),
  services: ServiceFactory.buildList(15),
  products: ProductFactory.buildList(25),
  blogPosts: BlogPostFactory.buildList(8),
  reviews: ReviewFactory.buildList(20),
}

// Helper functions for test cleanup
export const TestDataCleaner = {
  async cleanupUsers(userIds: string[]) {
    // In a real implementation, this would clean up user data from the database
    console.log(`Cleaning up ${userIds.length} test users`)
  },
  
  async cleanupBookings(bookingIds: string[]) {
    console.log(`Cleaning up ${bookingIds.length} test bookings`)
  },
  
  async cleanupOrders(orderIds: string[]) {
    console.log(`Cleaning up ${orderIds.length} test orders`)
  },
  
  async cleanupAll() {
    console.log('Cleaning up all test data')
  },
}