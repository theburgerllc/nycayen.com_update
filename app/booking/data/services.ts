import { Service, ServicePackage, AddOn } from '../types';

export const services: Service[] = [
  {
    id: 'precision-cut',
    title: 'Precision Cut',
    price: 85,
    duration: 60,
    description: 'Expert haircut tailored to your face shape and lifestyle',
    features: [
      'Face-shape consultation',
      'Precision cutting technique',
      'Styling tips included',
      'Clean finish & blowout'
    ],
    category: 'cut'
  },
  {
    id: 'color-artistry',
    title: 'Color Artistry',
    price: 120,
    duration: 120,
    description: 'Professional color services from subtle highlights to bold transformations',
    features: [
      'Color consultation',
      'Premium color products',
      'Toner & gloss included',
      'Hair health protection'
    ],
    category: 'color'
  },
  {
    id: 'wig-design',
    title: 'Custom Wig Design',
    price: 200,
    duration: 90,
    description: 'Bespoke wig design and fitting service',
    features: [
      'Custom fitting session',
      'Professional styling',
      'Quality cap materials',
      'Maintenance guidance'
    ],
    category: 'wig'
  },
  {
    id: 'bridal-styling',
    title: 'Bridal Hair Styling',
    price: 150,
    duration: 90,
    description: 'Wedding day hair perfection with trial session',
    features: [
      'Bridal consultation',
      'Trial styling session',
      'Wedding day service',
      'Touch-up kit included'
    ],
    category: 'bridal'
  },
  {
    id: 'balayage',
    title: 'Balayage Highlights',
    price: 180,
    duration: 150,
    description: 'Hand-painted highlights for natural-looking dimension',
    features: [
      'Freehand painting technique',
      'Natural color blending',
      'Glossing treatment',
      'Styling finish'
    ],
    category: 'color'
  },
  {
    id: 'keratin-treatment',
    title: 'Keratin Smoothing',
    price: 250,
    duration: 180,
    description: 'Professional smoothing treatment for frizz-free hair',
    features: [
      'Deep conditioning',
      'Frizz elimination',
      '3-4 month results',
      'After-care products'
    ],
    category: 'color'
  }
];

export const servicePackages: ServicePackage[] = [
  {
    id: 'complete-makeover',
    title: 'Complete Hair Makeover',
    services: ['precision-cut', 'color-artistry'],
    originalPrice: 205,
    discountedPrice: 185,
    savings: 20,
    description: 'Cut and color combo for a total transformation'
  },
  {
    id: 'bridal-package',
    title: 'Bridal Beauty Package',
    services: ['bridal-styling', 'precision-cut'],
    originalPrice: 235,
    discountedPrice: 215,
    savings: 20,
    description: 'Complete bridal preparation with cut and styling'
  },
  {
    id: 'luxury-experience',
    title: 'Luxury Experience',
    services: ['precision-cut', 'balayage', 'keratin-treatment'],
    originalPrice: 515,
    discountedPrice: 465,
    savings: 50,
    description: 'Ultimate hair transformation package'
  }
];

export const addOns: AddOn[] = [
  {
    id: 'deep-conditioning',
    title: 'Deep Conditioning Treatment',
    price: 35,
    duration: 20,
    description: 'Intensive moisture treatment for healthier hair',
    category: 'care'
  },
  {
    id: 'scalp-massage',
    title: 'Scalp Massage',
    price: 25,
    duration: 15,
    description: 'Relaxing scalp massage with essential oils',
    category: 'care'
  },
  {
    id: 'hair-gloss',
    title: 'Hair Gloss Treatment',
    price: 45,
    duration: 30,
    description: 'Add shine and enhance color vibrancy',
    category: 'treatment'
  },
  {
    id: 'styling-lesson',
    title: 'Personal Styling Lesson',
    price: 60,
    duration: 30,
    description: 'Learn to style your hair like a pro',
    category: 'styling'
  },
  {
    id: 'hair-extensions',
    title: 'Clip-in Extensions Application',
    price: 75,
    duration: 45,
    description: 'Professional extension application and blending',
    category: 'styling'
  },
  {
    id: 'eyebrow-shaping',
    title: 'Eyebrow Shaping',
    price: 40,
    duration: 20,
    description: 'Perfect your brow shape to complement your new look',
    category: 'styling'
  }
];