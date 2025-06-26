# Nycayen Moore Hair Artistry Website

A luxury hair artistry and wig design website built with Next.js 14, featuring modern design, smooth a
nimations, and mobile-first responsive layout.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with glassmorphism navigation
- **Performance Optimized**: Image optimization, lazy loading, and caching
- **SEO Ready**: Comprehensive meta tags, JSON-LD schema, and sitemap
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Interactive Components**: Framer Motion animations, contact forms, portfolio gallery
- **Professional Sections**: Hero, Services, Portfolio, About, Testimonials, Contact

## 📁 Project Structure

```
nycayen.com_update/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── BeforeAfter.tsx  # Image comparison component
│   │   ├── ChatToggleButton.tsx # Tidio chat integration
│   │   ├── Contact.tsx      # Contact form with validation
│   │   ├── Navigation.tsx   # Mobile navigation with glassmorphism
│   │   ├── Portfolio.tsx    # Filterable portfolio gallery
│   │   ├── Services.tsx     # Service offerings display
│   │   └── Testimonials.tsx # Interactive testimonial carousel
│   ├── sections/            # Page sections
│   │   ├── About.tsx        # About section with bio and certifications
│   │   ├── Hero.tsx         # Landing hero with video background
│   │   └── InstagramFeed.tsx # Instagram integration
│   ├── globals.css          # Global styles and Tailwind components
│   ├── layout.tsx           # Root layout with SEO and meta tags
│   └── page.tsx             # Main landing page
├── public/                  # Static assets (add your images here)
├── .eslintrc.json          # ESLint configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependencies and scripts
```

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nycayen.com_update
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Customization

### Adding Images
Place your images in the `public/` directory:
- `public/images/nycayen-headshot.jpg` - Professional headshot for About section
- `public/images/og-image.jpg` - Social media preview image
- `public/videos/hero-loop.mp4` - Hero background video
- `public/port/` - Portfolio before/after images

### Updating Content
1. **Services**: Edit `app/components/Services.tsx`
2. **About Bio**: Edit `app/sections/About.tsx`
3. **Contact Info**: Edit `app/components/Contact.tsx`
4. **SEO Meta Tags**: Edit `app/layout.tsx`

### Styling
- **Colors**: Modify `tailwind.config.js` color palette
- **Fonts**: Update Google Fonts links in `app/layout.tsx`
- **Custom CSS**: Add styles to `app/globals.css`

## 🚀 Deployment to Vercel

### Method 1: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: complete luxury hair artistry site"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Configure settings (use defaults)
   - Click "Deploy"

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts**
   - Link to existing project or create new
   - Set up production deployment

### Environment Variables

**Optional Configuration:**
Copy `.env.example` to `.env.local` and configure:

```bash
# Tidio Chat Widget (already integrated - no setup needed)
# NEXT_PUBLIC_TIDIO_KEY=rlmuazdh9xqfjbiicz6swwgfhdhgyyca

# Instagram Widget (optional) 
NEXT_PUBLIC_INSTAGRAM_WIDGET_ID=your_embedsocial_widget_id

# Contact Form Service (optional)
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id

# Google Search Console (optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_google_verification_code
```

**Vercel Deployment:**
Add these same variables in your Vercel dashboard under Settings > Environment Variables.

## 📊 Performance Optimization

The site is optimized for:
- **Core Web Vitals**: Lighthouse score 90+
- **Image Optimization**: Next.js Image component with AVIF/WebP
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Static assets cached for 1 year
- **SEO**: Complete meta tags and JSON-LD schema

## 🔧 Configuration Files

### Key Configurations
- **next.config.js**: Image domains, headers, compression
- **vercel.json**: Deployment settings and caching rules
- **tailwind.config.js**: Design system and custom utilities
- **.eslintrc.json**: Code quality and style rules

## 📱 Mobile Features
- Responsive design for all screen sizes
- Touch-friendly navigation
- Optimized images for mobile devices
- Fast loading with prefetching

## 🎯 SEO Features
- Open Graph tags for social media
- Twitter Card support
- JSON-LD structured data for local business
- Sitemap generation
- Meta tags optimization

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Type Errors**
   ```bash
   npm run type-check
   ```

3. **Styling Issues**
   - Check Tailwind CSS configuration
   - Verify class names in components
   - Clear browser cache

### Support
For technical issues, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License
MIT License - feel free to customize for your needs.

---

Built with ❤️ by Tim B. for the illustrious Mr. Nycayen Moore
 using Next.js 14, TypeScript, and Tailwind CSS