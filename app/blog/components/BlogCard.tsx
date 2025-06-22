import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';
import { formatDate } from '../utils';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <article className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
      featured ? 'lg:col-span-2' : ''
    }`}>
      <Link href={post.url} className="block">
        <div className="relative overflow-hidden">
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            width={featured ? 800 : 400}
            height={featured ? 400 : 250}
            className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {post.featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <Link
            href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            {post.category}
          </Link>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt, 'short')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min</span>
          </div>
        </div>

        <Link href={post.url}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map(tag => (
            <Link
              key={tag}
              href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-purple-100 hover:text-purple-600 transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-900">{post.author.name}</p>
            </div>
          </div>

          <Link
            href={post.url}
            className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium text-sm group/link"
          >
            <span>Read more</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}