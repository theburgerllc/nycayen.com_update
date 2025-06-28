import { NextResponse } from 'next/server';
import { getAllPosts } from '../utils';

export async function GET() {
  const posts = getAllPosts().slice(0, 20); // Latest 20 posts
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nycayen.com';

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nycayen Hair Artistry Blog</title>
    <description>Latest insights, tips, and trends from NYC's premier hair artistry and luxury wig design studio.</description>
    <link>${baseUrl}/blog</link>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${baseUrl}${post.url}</link>
      <guid isPermaLink="false">${baseUrl}${post.url}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <author>noreply@nycayen.com (${post.author?.name || 'Nycayen Moore'})</author>
      <category>${post.category}</category>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}