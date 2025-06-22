import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types';
import { formatDate } from '../utils';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-rose-900 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={post.coverImage.src}
          alt={post.coverImage.alt}
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/90 to-rose-900/90" />
      </div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </nav>

        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center space-x-4 text-sm text-white/80 mb-6">
            <Link
              href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-3 py-1 bg-purple-600/30 backdrop-blur-sm rounded-full border border-purple-400/30 hover:bg-purple-600/50 transition-colors"
            >
              {post.category}
            </Link>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt, 'long')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 text-sm bg-white/10 backdrop-blur-sm text-white/90 rounded-md border border-white/20 hover:bg-white/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-white/20"
              />
            )}
            <div>
              <div className="flex items-center space-x-2 text-white">
                <User className="w-4 h-4" />
                <span className="font-medium">{post.author.name}</span>
              </div>
              {post.author.bio && (
                <p className="text-white/80 text-sm mt-1">{post.author.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}