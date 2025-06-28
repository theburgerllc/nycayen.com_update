# Vercel Deployment Guide for Nycayen.com

## 🚀 Quick Deployment

### Prerequisites
- Vercel account connected to your GitHub repository
- Environment variables configured (see below)

### 1. Deploy to Vercel

```bash
# Option 1: Deploy via Vercel Dashboard
# 1. Go to vercel.com/dashboard
# 2. Click "New Project"
# 3. Import from GitHub: theburgerllc/nycayen.com_update
# 4. Configure environment variables (see section below)
# 5. Deploy

# Option 2: Deploy via CLI
npm i -g vercel
vercel login
vercel --prod
```

### 2. Required Environment Variables

Configure these in your Vercel project settings:

```bash
# Core Application
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production

# Instagram Integration
NEXT_PUBLIC_INSTAGRAM_TOKEN=your_instagram_basic_display_token
NEXT_PUBLIC_INSTAGRAM_HANDLE=nycayenmoore
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Contact Form (Formspree)
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_form_id
FORMSPREE_API_KEY=your_formspree_api_key

# Analytics & Monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Chat Widget (Tidio)
NEXT_PUBLIC_TIDIO_KEY=your_tidio_key

# Email Services (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Stripe (for payments - Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🔧 Vercel Configuration

The repository includes a comprehensive `vercel.json` configuration with:

### Build Settings
- **Framework:** Next.js 14
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node Version:** 18.x (automatic)

### Performance Optimizations
- **Regions:** Multiple edge locations (iad1, sfo1, lhr1)
- **Function Timeout:** 30 seconds for API routes
- **Caching:** Optimized cache headers for static assets

### Security Headers
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy, Permissions Policy

### Automated Processes
- **Daily Maintenance:** Single cron job at 06:00 UTC (compliant with Hobby plan)
  - Instagram feed refresh
  - Analytics data aggregation  
  - Cache cleanup and optimization
  - System health monitoring
- **Health Checks:** Built-in monitoring endpoints

## 📊 Monitoring & Health Checks

### Built-in Endpoints
- **Health Check:** `/api/health` - Basic server health
- **Status Check:** `/api/status` - Detailed system status
- **Instagram Refresh:** `/api/instagram/refresh` - Manual refresh trigger

### Performance Monitoring
- Vercel Analytics integration
- Web Vitals tracking
- Custom performance metrics
- Error boundary reporting

## 🎯 SEO & Marketing Ready

### Automatic Features
- **Sitemap Generation:** `/sitemap.xml`
- **Robots.txt:** `/robots.txt` 
- **Structured Data:** Local business schema
- **Open Graph:** Social media optimization
- **Meta Tags:** Comprehensive SEO metadata

### Local SEO
- Google My Business integration ready
- Local business schema markup
- Contact information structured data
- Service offerings optimization

## 🔍 Testing & Validation

### Pre-deployment Checks
```bash
# Build test
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Performance audit
npm run perf:audit
```

### Post-deployment Verification
1. **Core Web Vitals:** Check Lighthouse scores
2. **Social Media:** Test Open Graph previews
3. **Contact Forms:** Verify form submissions
4. **Instagram Feed:** Confirm API connections
5. **Analytics:** Validate tracking events

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are set
- Verify Node.js version compatibility
- Review build logs for specific errors

**Instagram API Issues:**
- Refresh Instagram access token
- Verify app permissions and scopes
- Check API rate limits

**Form Submission Problems:**
- Validate Formspree configuration
- Check CORS settings
- Verify API keys and endpoints

**Performance Issues:**
- Review image optimization settings
- Check bundle size with analyzer
- Verify CDN configuration

### Debug Mode
```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG=true

# Enable verbose build output
NEXT_PUBLIC_VERBOSE=true
```

## 📱 Domain Configuration

### Custom Domain Setup
1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate:**
   - Automatic via Vercel (Let's Encrypt)
   - No additional configuration needed

3. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www (or @)
   Value: your-project.vercel.app
   ```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Production:** `main` branch → Production deployment
- **Preview:** Pull requests → Preview deployments
- **Branch Deployments:** Feature branches → Preview URLs

### Deployment Hooks
- Pre-build: Dependency installation
- Build: Next.js compilation
- Post-build: Asset optimization
- Deploy: Edge network distribution

## 💡 Optimization Tips

### Performance
- Use Vercel Image Optimization for all images
- Enable compression for all text assets
- Leverage edge caching for static content
- Monitor Core Web Vitals regularly

### SEO
- Update sitemap regularly
- Monitor search console for errors
- Keep structured data current
- Optimize meta descriptions for pages

### Analytics
- Set up conversion tracking
- Monitor user behavior patterns
- Track business metrics
- A/B test important elements

## 📞 Support

### Resources
- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Repository Issues:** GitHub Issues for bug reports

### Performance Monitoring
- Vercel Analytics Dashboard
- Web Vitals monitoring
- Custom metrics tracking
- Error reporting integration

---

**Deployment Status:** ✅ Ready for Production
**Last Updated:** December 2024
**Framework:** Next.js 14 with App Router
**Deployment Platform:** Vercel