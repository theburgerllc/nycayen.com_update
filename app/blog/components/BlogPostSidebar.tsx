import Link from 'next/link';
import { BookOpen, Share2, List } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPostSidebarProps {
  post: BlogPost;
}

export function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  return (
    <div className="sticky top-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <List className="w-5 h-5" />
          <span>Table of Contents</span>
        </h3>
        
        {post.tableOfContents.length > 0 ? (
          <nav className="space-y-2">
            {post.tableOfContents.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-sm text-gray-600 hover:text-purple-600 transition-colors ${
                  item.level === 1 ? 'font-medium' :
                  item.level === 2 ? 'pl-4' :
                  item.level === 3 ? 'pl-8' :
                  'pl-12'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        ) : (
          <p className="text-sm text-gray-500">No headings found in this post.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Post Details</span>
        </h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <Link
              href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              {post.category}
            </Link>
          </div>
          
          <div>
            <span className="text-gray-500">Reading Time:</span>
            <span className="ml-2 text-gray-900">{post.readingTime} minutes</span>
          </div>
          
          <div>
            <span className="text-gray-500">Word Count:</span>
            <span className="ml-2 text-gray-900">{post.wordCount.toLocaleString()} words</span>
          </div>
          
          <div>
            <span className="text-gray-500">Published:</span>
            <span className="ml-2 text-gray-900">
              {post.publishedAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          
          {post.updatedAt && (
            <div>
              <span className="text-gray-500">Updated:</span>
              <span className="ml-2 text-gray-900">
                {post.updatedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">About the Author</h3>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">{post.author.name}</h4>
          {post.author.bio && (
            <p className="text-sm text-gray-600">{post.author.bio}</p>
          )}
          {post.author.social && (
            <div className="flex space-x-3">
              {post.author.social.instagram && (
                <a
                  href={`https://instagram.com/${post.author.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Instagram
                </a>
              )}
              {post.author.social.twitter && (
                <a
                  href={`https://twitter.com/${post.author.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Twitter
                </a>
              )}
              {post.author.social.linkedin && (
                <a
                  href={`https://linkedin.com/in/${post.author.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}