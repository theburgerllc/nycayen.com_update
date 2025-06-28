import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogGrid } from '../../components/BlogGrid';
import { getAllCategories, getPostsByCategory, getCategoryBySlug, slugify } from '../../utils';

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(category => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Hair Artistry Blog`,
    description: `Explore all posts in the ${category.name} category. ${category.description}`,
    openGraph: {
      title: `${category.name} | Hair Artistry Blog`,
      description: `Explore all posts in the ${category.name} category. ${category.description}`,
      type: 'website',
      url: `/blog/category/${category.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | Hair Artistry Blog`,
      description: `Explore all posts in the ${category.name} category. ${category.description}`,
    },
  };
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category);
  
  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(params.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <nav className="mb-6">
            <a 
              href="/blog" 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Blog
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-purple-600 font-medium">{category.name}</span>
          </nav>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {category.name}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            {category.description}
          </p>
          
          <p className="text-gray-500">
            {category.count} {category.count === 1 ? 'post' : 'posts'}
          </p>
        </header>

        <BlogGrid 
          posts={posts}
          searchParams={searchParams}
          showFilters={false}
        />
      </div>
    </div>
  );
}