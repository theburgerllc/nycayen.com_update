# Vercel Deployment Guide

This project is configured for seamless deployment on Vercel. Follow these steps to deploy your luxury hair artistry website.

## 🚀 Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** (see below)

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** and configure environment variables

## 🔧 Environment Variables Setup

Add these environment variables in your Vercel dashboard under Project Settings > Environment Variables:

### 🔐 Required for Production

```bash
# Site Configuration
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Instagram Integration
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_USER_ID=your_instagram_user_id
INSTAGRAM_TOKEN_REFRESH_THRESHOLD=604800
INSTAGRAM_CACHE_DURATION=3600
INSTAGRAM_MAX_POSTS=50
INSTAGRAM_RATE_LIMIT_PER_HOUR=200

# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Email Service (Formspree)
FORMSPREE_FORM_ID=your_formspree_form_id

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 📧 Email Marketing (Optional)
```bash
# Mailchimp
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_LIST_ID=your_mailchimp_list_id

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 📊 Database (Optional)
```bash
# For user data and bookings
DATABASE_URL=your_database_connection_string
```

## 🎯 Post-Deployment Setup

### 1. Domain Configuration
- Add your custom domain in Vercel dashboard
- Update `NEXT_PUBLIC_SITE_URL` environment variable
- Configure DNS settings

### 2. Instagram Setup
1. Create Facebook Developer App
2. Add Instagram Basic Display product
3. Generate long-lived access token
4. Add tokens to environment variables

### 3. Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Set up webhook endpoints:
   - `https://your-domain.vercel.app/api/webhooks/stripe`
4. Add webhook secret to environment variables

### 4. Formspree Setup
1. Create account at formspree.io
2. Create a form
3. Add form ID to environment variables

### 5. Google Analytics Setup
1. Create GA4 property
2. Get tracking ID
3. Add to environment variables

## 📁 File Upload Guide

Upload these files to `/public` directory:

### Required Images:
- `images/nycayen-headshot.jpg` (400x500px)
- `images/og-image.jpg` (1200x630px)

### Portfolio Images (400x300px each):
- `port/b1-before.jpg` & `port/b1-after.jpg`
- `port/b2-before.jpg` & `port/b2-after.jpg`
- `port/b3-before.jpg` & `port/b3-after.jpg`
- `port/b4-before.jpg` & `port/b4-after.jpg`
- `port/b5-before.jpg` & `port/b5-after.jpg`
- `port/b6-before.jpg` & `port/b6-after.jpg`

### Optional:
- `videos/hero-loop.mp4` (Background video)
- Update favicon files

## ⚡ Performance Optimizations

The project includes:
- ✅ Static Site Generation (SSG)
- ✅ Image optimization with Next.js Image component
- ✅ Automatic code splitting
- ✅ CDN distribution via Vercel Edge Network
- ✅ Gzip compression
- ✅ Cache headers optimization

## 🔒 Security Features

- ✅ Content Security Policy (CSP)
- ✅ Strict Transport Security (HSTS)
- ✅ XSS Protection
- ✅ Frame Options protection
- ✅ CSRF protection for forms

## 📊 Monitoring

The deployment includes:
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Analytics integration
- ✅ Health check endpoints

## 🔄 Automatic Updates

Configured cron jobs:
- Instagram feed refresh (every 6 hours)
- Analytics aggregation (daily at 1 AM)

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify API keys are valid

### Image Issues
- Verify image paths in `/public` directory
- Check file formats (jpg, png, webp)
- Ensure proper file permissions

## 📞 Support

For deployment issues:
1. Check Vercel dashboard logs
2. Review environment variables
3. Verify API integrations
4. Check DNS configuration

---

🎉 **Your luxury hair artistry website is ready to go live!**